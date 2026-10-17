import { panelVerdict, type PanelScore } from "../../engine/panelScore";
import { Icon, type IconName } from "../kit/IconSet";
import { useCountUp } from "../kit/useCountUp";

export interface PanelFlipsProps<I extends string> {
  readonly panels: readonly PanelScore<I>[];
  readonly iconOf: (id: I) => IconName;
  readonly instant: boolean;
  readonly block: string;
}

interface FlipProps<I extends string> {
  readonly panel: PanelScore<I>;
  readonly icon: IconName;
  readonly order: number;
  readonly instant: boolean;
  readonly block: string;
}

function Flip<I extends string>({ panel, icon, order, instant, block }: FlipProps<I>) {
  const delay = 300 + order * 500;
  const score = useCountUp(panel.score, 1200, delay, instant);
  return (
    <article
      className={`${block} ${block}--${panel.id}`}
      style={{ animationDelay: instant ? "0ms" : `${delay - 300}ms` }}
      aria-label={`${panel.label}: ${panel.score} out of 100, ${panelVerdict(panel.score)}`}
      data-testid={`flip-${panel.id}`}
    >
      <span className={`${block}__icon`} aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
      <strong className={`${block}__name`}>{panel.label}</strong>
      <span className={`${block}__score`} aria-hidden="true">
        {score}
      </span>
      <span className={`${block}__verdict`}>{panelVerdict(panel.score)}</span>
    </article>
  );
}

export function PanelFlips<I extends string>({ panels, iconOf, instant, block }: PanelFlipsProps<I>) {
  return (
    <div className={`${block}s`}>
      {panels.map((panel, order) => (
        <Flip
          key={panel.id}
          panel={panel}
          icon={iconOf(panel.id)}
          order={order}
          instant={instant}
          block={block}
        />
      ))}
    </div>
  );
}

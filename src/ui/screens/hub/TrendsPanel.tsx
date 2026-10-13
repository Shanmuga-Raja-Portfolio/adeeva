import { visibleNextTrends, type GameState } from "../../../core";
import { Card } from "../../kit/Card";
import { Icon } from "../../kit/IconSet";
import { TagPill } from "../../kit/TagPill";

export interface TrendsPanelProps {
  state: GameState;
}

export function TrendsPanel({ state }: TrendsPanelProps) {
  const next = visibleNextTrends(state);
  return (
    <Card title="Trend market" eyebrow="This week" tone="rose" className="ad-hub-card ad-trends">
      <p className="ad-trends__lead">Dresses with these vibes earn a bonus and extra buzz.</p>
      <div className="ad-trends__tags">
        {state.trends.current.map((tag) => (
          <TagPill key={tag} tone="hot">
            <Icon name="sparkle" size={12} />
            {tag}
          </TagPill>
        ))}
      </div>
      {next !== null ? (
        <div className="ad-trends__insight">
          <span className="ad-eyebrow ad-trends__insight-label">
            <Icon name="megaphone" size={14} /> Trendsetter insight · next week
          </span>
          <div className="ad-trends__tags">
            {next.map((tag) => (
              <TagPill key={tag} tone="next">
                {tag}
              </TagPill>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

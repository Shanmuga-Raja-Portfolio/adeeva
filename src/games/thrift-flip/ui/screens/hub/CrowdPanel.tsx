import { Card } from "../../../../../ui/kit/Card";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { visibleNextTrends, type GameState } from "../../../core";

export interface CrowdPanelProps {
  readonly state: GameState;
}

export function CrowdPanel({ state }: CrowdPanelProps) {
  const next = visibleNextTrends(state);
  return (
    <Card title="This week's crowd" eyebrow="What shoppers love" className="tf-hub-card tf-crowd">
      <div className="tf-crowd__tags">
        {state.trends.current.map((tag) => (
          <TagPill key={tag} tone="hot">
            {tag}
          </TagPill>
        ))}
      </div>
      {next !== null ? (
        <div className="tf-crowd__next">
          <span className="ad-eyebrow">Next week, you hear</span>
          <div className="tf-crowd__tags">
            {next.map((tag) => (
              <TagPill key={tag} tone="next">
                {tag}
              </TagPill>
            ))}
          </div>
        </div>
      ) : null}
      <p className="ad-muted tf-crowd__note">Flips that match the crowd earn extra buzz and coins.</p>
    </Card>
  );
}

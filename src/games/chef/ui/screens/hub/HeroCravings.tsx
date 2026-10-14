import { TagPill } from "../../../../../ui/kit/TagPill";
import { visibleNextTrends, type GameState } from "../../../core";

export interface HeroCravingsProps {
  readonly state: GameState;
}

export function HeroCravings({ state }: HeroCravingsProps) {
  const next = visibleNextTrends(state);
  return (
    <div className="ck-hero__cravings" aria-label="Town cravings">
      <span className="ck-hero__label">Town cravings</span>
      {state.trends.current.map((tag) => (
        <TagPill key={tag} tone="hot">
          {tag}
        </TagPill>
      ))}
      {next === null ? null : (
        <>
          <span className="ck-hero__label">Next week</span>
          {next.map((tag) => (
            <TagPill key={tag} tone="next">
              {tag}
            </TagPill>
          ))}
        </>
      )}
    </div>
  );
}

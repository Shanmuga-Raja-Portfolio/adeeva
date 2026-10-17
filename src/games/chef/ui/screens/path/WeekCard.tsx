import { daysUntilWeekEnd } from "../../../../../engine/weekday";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { pathById, weeklyBill, type GameState, type PathState } from "../../../core";
import { HeroCravings } from "../hub/HeroCravings";
import { rentLine } from "../hub/rentLine";
import { PathAwards } from "./PathAwards";

export interface WeekCardProps {
  readonly state: GameState;
  readonly path: PathState;
}

export function WeekCard({ state, path }: WeekCardProps) {
  return (
    <Card title="This week" eyebrow={`Day ${state.calendar.day}`} className="ck-panel ck-week-card">
      <p className="ck-week-card__rent">
        <Icon name="home" size={18} />
        {rentLine(weeklyBill(state), pathById(path.kind).home, daysUntilWeekEnd(state.calendar.day))}
      </p>
      <HeroCravings state={state} />
      <PathAwards path={path} className="ck-path-awards--card" />
    </Card>
  );
}

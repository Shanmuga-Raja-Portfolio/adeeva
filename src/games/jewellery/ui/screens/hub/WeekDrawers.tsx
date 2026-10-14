import { DAYS_PER_WEEK } from "../../../../../engine/week";
import { weekdayName } from "../../../../../engine/weekday";

interface WeekDrawersProps {
  readonly day: number;
}

export function WeekDrawers({ day }: WeekDrawersProps) {
  const weekStart = Math.floor((day - 1) / DAYS_PER_WEEK) * DAYS_PER_WEEK + 1;
  return (
    <ol className="jb-drawers" aria-label="This week">
      {Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
        const drawerDay = weekStart + index;
        const market = index === DAYS_PER_WEEK - 1;
        const state = drawerDay < day ? "past" : drawerDay === day ? "today" : "ahead";
        return (
          <li
            key={drawerDay}
            className={`jb-drawer jb-drawer--${state}${market ? " jb-drawer--market" : ""}`}
            aria-current={state === "today" ? "date" : undefined}
            title={market ? `${weekdayName(drawerDay)}: Market Day` : weekdayName(drawerDay)}
          >
            <span className="jb-drawer__label">{weekdayName(drawerDay).slice(0, 2)}</span>
            <span className="jb-drawer__knob" aria-hidden="true" />
          </li>
        );
      })}
    </ol>
  );
}

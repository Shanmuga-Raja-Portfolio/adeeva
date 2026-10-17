import { daysUntilWeekEnd } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import { canEndDay, canPotWash, weeklyBill, type GameState } from "../../../core";
import { rentLine } from "./rentLine";

export interface HeroDayActionsProps {
  readonly state: GameState;
  readonly home: string;
  readonly onPotWash: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

export function HeroDayActions({ state, home, onPotWash, onEndDay }: HeroDayActionsProps) {
  const potWash = canPotWash(state);
  const endDay = canEndDay(state);
  return (
    <>
      <div className="ck-hero__actions">
        {potWash.ok ? (
          <Button variant="secondary" onClick={onPotWash} data-testid="pot-wash">
            Pot-wash day (+{CAREER.potWashPay})
          </Button>
        ) : null}
        <Button
          variant={potWash.ok ? "secondary" : "primary"}
          icon="calendar"
          onClick={onEndDay}
          disabledReason={endDay.reasons[0]}
          data-testid="end-day"
        >
          End the day
        </Button>
      </div>
      <p className="ck-hero__rent">
        <Icon name="home" size={16} />
        {rentLine(weeklyBill(state), home, daysUntilWeekEnd(state.calendar.day))}
      </p>
    </>
  );
}

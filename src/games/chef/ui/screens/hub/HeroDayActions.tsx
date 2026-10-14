import { daysUntilWeekEnd } from "../../../../../engine/weekday";
import { Button } from "../../../../../ui/kit/Button";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import { canEndDay, canPotWash, weeklyBill, type GameState } from "../../../core";

export interface HeroDayActionsProps {
  readonly state: GameState;
  readonly home: string;
  readonly onPotWash: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
}

function rentLine(bill: number, home: string, rentIn: number): string {
  if (bill === 0) return `No rent for ${home} on this difficulty.`;
  if (rentIn === 0) return `Rent of ${bill} coins for ${home} is due tonight.`;
  return `Rent for ${home}: ${bill} coins in ${rentIn} ${rentIn === 1 ? "day" : "days"}.`;
}

export function HeroDayActions({ state, home, onPotWash, onEndDay }: HeroDayActionsProps) {
  const potWash = canPotWash(state);
  const endDay = canEndDay(state);
  return (
    <>
      <p className="ck-hero__rent">
        {rentLine(weeklyBill(state), home, daysUntilWeekEnd(state.calendar.day))}
      </p>
      <div className="ck-hero__actions">
        <Button
          variant="secondary"
          onClick={onPotWash}
          disabledReason={potWash.reasons[0]}
          data-testid="pot-wash"
        >
          Pot-wash day (+{CAREER.potWashPay})
        </Button>
        <Button icon="calendar" onClick={onEndDay} disabledReason={endDay.reasons[0]} data-testid="end-day">
          End the day
        </Button>
      </div>
    </>
  );
}

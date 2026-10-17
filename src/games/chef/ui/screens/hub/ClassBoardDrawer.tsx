import type { ReactNode } from "react";
import { daysUntilWeekEnd } from "../../../../../engine/weekday";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import { rungById, weeklyBill, type GameState } from "../../../core";
import { HeroCravings } from "./HeroCravings";
import { rentLine } from "./rentLine";

export interface ClassBoardDrawerProps {
  readonly state: GameState;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function ClassBoardDrawer({ state, open, onClose, children }: ClassBoardDrawerProps) {
  const rung = rungById(state.rung);
  return (
    <Dialog open={open} title="Class board" onClose={onClose} className="ck-drawer">
      <div className="ck-drawer__week">
        <p className="ck-drawer__rent">
          <Icon name="home" size={18} />
          {rentLine(weeklyBill(state), rung.home, daysUntilWeekEnd(state.calendar.day))}
        </p>
        <HeroCravings state={state} />
      </div>
      {children}
    </Dialog>
  );
}

import { useState, type ReactNode } from "react";
import { BASE_DAY_HOURS, dayGreeting } from "../../../../../engine/dayHours";
import { weekdayName, weekNumber } from "../../../../../engine/weekday";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { careerById, type GameState } from "../../../core";
import { rentNote } from "./rentNote";
import "./dayRibbon.css";

export interface DayRibbonProps {
  readonly state: GameState;
  readonly note: string | null;
  readonly children?: ReactNode;
}

const PIPS = Array.from({ length: BASE_DAY_HOURS }, (_, index) => index);

export function DayRibbon({ state, note, children }: DayRibbonProps) {
  const [open, setOpen] = useState(false);
  const { profile, calendar } = state;
  const career = careerById(state.career);
  const left = calendar.hoursLeft;
  return (
    <div className="pa-day-ribbon">
      <div className="pa-day-ribbon__band">
        <h1 className="pa-day-ribbon__hello">
          {dayGreeting(left, BASE_DAY_HOURS)}, {profile.name}
        </h1>
        <span
          className="pa-day-ribbon__hours"
          role="img"
          aria-label={`${left} of ${BASE_DAY_HOURS} hours left today`}
        >
          <span className="pa-day-ribbon__pips" aria-hidden="true">
            {PIPS.map((pip) => (
              <span
                key={pip}
                className={pip < left ? "pa-day-ribbon__pip pa-day-ribbon__pip--on" : "pa-day-ribbon__pip"}
              />
            ))}
          </span>
          <strong aria-hidden="true">{left} h left</strong>
        </span>
        <button
          type="button"
          className="pa-day-ribbon__more"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          data-testid="day-details"
        >
          <Icon name="calendar" size={18} />
          Today
        </button>
      </div>
      {note !== null ? (
        <p className="pa-day-ribbon__note">
          <Icon name="heart" size={18} /> {note}
        </p>
      ) : null}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`${weekdayName(calendar.day)}, week ${weekNumber(calendar.day)}`}
        className="pa-day-details"
      >
        <p className="pa-day-details__place">
          <Icon name="home" size={18} /> {career.placeName}
        </p>
        {note !== null ? <p className="pa-day-details__note">{note}</p> : null}
        <Meter
          label="Hours left today"
          tone="sage"
          value={left}
          max={BASE_DAY_HOURS}
          valueText={`${left} of ${BASE_DAY_HOURS}`}
        />
        <p className="pa-day-details__row">
          <Icon name="coin" size={18} /> {rentNote(state)}
        </p>
        {children}
      </Dialog>
    </div>
  );
}

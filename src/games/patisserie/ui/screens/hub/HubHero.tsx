import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { careerById, canWorkShift, dayKind, offersFor, type GameState } from "../../../core";
import { BakerFigure } from "../../art/BakerFigure";
import { BakeryBackdrop } from "../../art/BakeryBackdrop";
import { ShopCounter } from "../../art/ShopCounter";
import { CounterCustomer } from "./CounterCustomer";
import { DayRibbon } from "./DayRibbon";
import { NextUpCard } from "./NextUpCard";
import { scrollToPlans } from "./scrollToPlans";
import "./bakeryHero.css";

export interface HubHeroProps {
  readonly state: GameState;
  readonly plansId: string;
  readonly onWorkShift: (event: ClickLike) => void;
  readonly onEndDay: (event: ClickLike) => void;
  readonly onStartOrder: (event: ClickLike, gigId: string) => void;
  readonly onBench: () => void;
}

const COUNTER_NOTE = "It's Counter Day! The oven rests. Open the counter and box up treats.";

export function HubHero({ state, plansId, onWorkShift, onEndDay, onStartOrder, onBench }: HubHeroProps) {
  const { profile, calendar } = state;
  const shift = canWorkShift(state);
  const kind = dayKind(state);
  const career = careerById(state.career);
  const evening = calendar.hoursLeft <= 3;
  const busy =
    (state.activeRun !== null && state.activeRun.stage !== "done") ||
    state.gigs.active.length > 0 ||
    offersFor(state).length > 0;
  return (
    <section className="pa-hub-hero" aria-label="Your day">
      <BakeryBackdrop className="pa-hub-hero__backdrop" evening={evening} />
      <div className="pa-hub-hero__figure" aria-hidden="true">
        <BakerFigure look={profile.look} name={profile.name} held="cake" />
      </div>
      <CounterCustomer state={state} />
      <ShopCounter className="pa-hub-hero__counter-front" />
      <button type="button" className="pa-hub-hero__more" onClick={() => scrollToPlans(plansId)}>
        Orders, pantry and upgrades
        <span className="pa-hub-hero__chevron" aria-hidden="true" />
      </button>
      <div className="pa-hub-hero__top">
        <DayRibbon state={state} note={kind === "counter" ? COUNTER_NOTE : null} />
      </div>
      <div className="pa-hub-hero__side">
        <NextUpCard
          state={state}
          onStart={onStartOrder}
          onBench={onBench}
          onSeeBoard={() => scrollToPlans(plansId)}
        />
      </div>
      <div className="pa-hub-hero__actions">
        <Button
          variant="secondary"
          className="pa-hub-hero__chore"
          onClick={onWorkShift}
          disabledReason={shift.ok ? undefined : shift.reasons.join(" ")}
          aria-label={`${career.shiftName} for ${career.shiftPay} coins`}
        >
          Wash trays
          <span className="pa-hub-hero__pay">
            <Icon name="coin" size={14} /> +{career.shiftPay}
          </span>
        </Button>
        <Button
          size={busy ? "md" : "lg"}
          variant={busy ? "secondary" : "primary"}
          icon="calendar"
          onClick={onEndDay}
          data-testid="end-day"
        >
          End day
        </Button>
      </div>
    </section>
  );
}

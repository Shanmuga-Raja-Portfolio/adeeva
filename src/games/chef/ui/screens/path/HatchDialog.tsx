import { useState } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { useRovingRadio } from "../../../../../ui/kit/useRovingRadio";
import { PATH_RULES } from "../../../content/career";
import {
  dishById,
  festivalById,
  festivalCost,
  festivalToday,
  forecastFestival,
  hireableHelpers,
  openFestivalIssues,
  type GameState,
  type TruckState,
} from "../../../core";
import { chefWhites } from "../../art/chefWhites";
import { staffRoleLine } from "./staffRole";

export interface HatchDialogProps {
  readonly state: GameState;
  readonly truck: TruckState;
  readonly open: boolean;
  readonly onStart: (helperId: string) => void;
  readonly onClose: () => void;
  readonly onMenu: () => void;
}

function Body({ state, truck, onStart, onClose, onMenu }: HatchDialogProps) {
  const [helper, setHelper] = useState<string | null>(null);
  const helpers = hireableHelpers();
  const roving = useRovingRadio(
    helpers.map((member) => ({ value: member.id })),
    helper,
    setHelper,
  );
  const slot = festivalToday(truck, state.calendar.day);
  const plan = forecastFestival(state, truck);
  if (slot === null || plan === null) return null;
  const festival = festivalById(slot.festivalId);
  const issue = openFestivalIssues(state, helper ?? "")[0];
  return (
    <Dialog
      open
      title={`Off to ${festival.name}`}
      onClose={onClose}
      className="ad-dialog--wide ck-dish-dialog"
      footer={
        <>
          <Button variant="ghost" onClick={onMenu}>
            Change the menu
          </Button>
          <Button
            icon="sparkle"
            onClick={() => helper !== null && onStart(helper)}
            disabledReason={issue}
            showReason
            data-testid="start-hatch"
          >
            Open the hatch
          </Button>
        </>
      }
    >
      <p className="ck-hatch__crowd">
        <Icon name="heart" size={16} /> About {plan.guests} guests love{" "}
        {festival.tags.map((tag) => (
          <TagPill key={tag} tone="hot">
            {tag}
          </TagPill>
        ))}
      </p>
      <ul className="ck-hatch__menu">
        {plan.dishes.map((dish) => (
          <li key={dish.dishId}>
            <strong>{dishById(dish.dishId).name}</strong> · {dish.stock} in the fridge · about {dish.wanted}{" "}
            wanted
          </li>
        ))}
      </ul>
      <p className="ck-muted">
        Pitch {festival.pitchFee} + helper {PATH_RULES.festivalHelperFee} + Market Run {plan.ingredients} ={" "}
        <strong>{festivalCost(state, truck)} coins</strong> today.
      </p>
      <p>Pick one helper for the day. They cook for the guests after the first eight tickets.</p>
      <div className="ck-helpers" role="radiogroup" aria-label="Helper for the day">
        {helpers.map((member, index) => (
          <button
            key={member.id}
            ref={roving.buttonRef(index)}
            type="button"
            role="radio"
            aria-checked={helper === member.id}
            tabIndex={roving.tabIndex(index)}
            onKeyDown={(event) => roving.handleKey(event, index)}
            className={helper === member.id ? "ck-helper ck-helper--on" : "ck-helper"}
            onClick={() => setHelper(member.id)}
            data-testid={`helper-${member.id}`}
          >
            <Avatar
              look={member.look}
              garment={chefWhites("#f28c28")}
              size={56}
              title={member.name}
              frameColour="#fbe6c2"
            />
            <span className="ck-helper__name">{member.name}</span>
            <span className="ck-muted">{staffRoleLine(member)}</span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}

export function HatchDialog(props: HatchDialogProps) {
  return props.open ? <Body {...props} /> : null;
}

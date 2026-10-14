import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { PATH_RULES } from "../../../content/career";
import {
  menuPortions,
  dishById,
  forecastFestival,
  forecastNight,
  ghostLayout,
  parIssue,
  type Action,
  type GameState,
  type MenuDish,
  type SalePlan,
} from "../../../core";
import { PlateArt } from "../../art/PlateArt";
import { HollisButton } from "./HollisButton";

export interface ReadyDialogProps {
  readonly state: GameState;
  readonly open: boolean;
  readonly dispatch: (action: Action) => boolean;
  readonly onClose: () => void;
}

function forecast(state: GameState): SalePlan | null {
  const path = state.path;
  if (path === null || path.kind === "tv") return null;
  return path.kind === "restaurant"
    ? forecastNight(state, path, state.calendar.day)
    : forecastFestival(state, path);
}

function ReadyRow({
  state,
  entry,
  wanted,
  dispatch,
}: {
  readonly state: GameState;
  readonly entry: MenuDish;
  readonly wanted: number | null;
  readonly dispatch: (action: Action) => boolean;
}) {
  const dish = dishById(entry.dishId);
  const set = (count: number) => dispatch({ type: "setPar", dishId: entry.dishId, count });
  const scale = Math.max(PATH_RULES.parMax, wanted ?? 0, entry.par);
  const share = (count: number) => Math.round((count / scale) * 100);
  return (
    <li className="ck-ready-row" data-testid={`ready-${entry.dishId}`}>
      <span className="ck-ready-row__icon" aria-hidden="true">
        <PlateArt colour="white" components={ghostLayout(dish)} title={null} />
      </span>
      <span className="ck-ready-row__dish">
        <strong>{dish.name}</strong>
        <span className="ck-muted">
          {wanted === null ? "Pick today's plan first" : `Guests may want about ${wanted}`}
        </span>
        {wanted === null ? null : (
          <span className="ck-ready-row__bar" aria-hidden="true">
            <span className="ck-ready-row__wanted" style={{ width: `${share(wanted)}%` }} />
            <span className="ck-ready-row__ready" style={{ width: `${share(entry.par)}%` }} />
          </span>
        )}
      </span>
      <span className="ck-ready-row__stepper">
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Get ready fewer ${dish.name}`}
          onClick={() => set(entry.par - 1)}
          disabled={parIssue(state, entry.dishId, entry.par - 1) !== null}
        >
          −
        </Button>
        <strong className="ck-ready-row__count" aria-live="polite">
          {entry.par}
        </strong>
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Get ready more ${dish.name}`}
          onClick={() => set(entry.par + 1)}
          disabled={parIssue(state, entry.dishId, entry.par + 1) !== null}
          data-testid={`more-${entry.dishId}`}
        >
          +
        </Button>
      </span>
    </li>
  );
}

export function ReadyDialog({ state, open, dispatch, onClose }: ReadyDialogProps) {
  const path = state.path;
  if (!open || path === null || path.kind === "tv") return null;
  const plan = forecast(state);
  const truck = path.kind === "truck";
  const total = menuPortions(path.menu);
  return (
    <Dialog
      open
      title={truck ? "Fill the fridge" : "Get ready"}
      onClose={onClose}
      className="ad-dialog--wide ck-ready-dialog"
      footer={
        <>
          <HollisButton state={state} desk="ready" dispatch={dispatch} />
          <Button onClick={onClose} data-testid="ready-done">
            Done
          </Button>
        </>
      }
    >
      <p className="ck-dish-dialog__lead">Get ready about what guests will want, not more.</p>
      {plan === null ? null : (
        <p className="ck-ready__forecast">
          <Icon name="heart" size={16} /> About {plan.guests} guests expected · Market Run {plan.ingredients}{" "}
          coins
        </p>
      )}
      {path.kind === "restaurant" && path.carried.length > 0 ? (
        <p className="ck-muted" data-testid="ready-carried">
          Already in the fridge: {path.carried.reduce((sum, item) => sum + item.count, 0)} portions. The
          Market Run only buys the rest.
        </p>
      ) : null}
      {truck ? (
        <Meter
          value={total}
          max={PATH_RULES.fridge}
          label={`Fridge: ${total} of ${PATH_RULES.fridge} portions`}
        />
      ) : null}
      <ul className="ck-ready-list">
        {path.menu.map((entry, index) => (
          <ReadyRow
            key={entry.dishId}
            state={state}
            entry={entry}
            wanted={plan?.dishes[index]?.wanted ?? null}
            dispatch={dispatch}
          />
        ))}
      </ul>
      <p className="ck-muted">
        Ready but not served goes to the Larkspur Community Fridge, but the coins are spent.
      </p>
    </Dialog>
  );
}

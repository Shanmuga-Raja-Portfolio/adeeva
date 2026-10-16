import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { SET_HINTS } from "../../../content/hint";
import {
  bayCount,
  isOnOwnRug,
  openHouseSale,
  rosetteById,
  rugsFor,
  seasonDay,
  setTemplateById,
  type Action,
  type FloorSet,
  type GameState,
} from "../../../core";
import { floorLooks } from "../../art/pieceLook";
import { SetPreview } from "../../art/SetPreview";

export interface ShowroomFloorCardProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onArrange: () => void;
}

function nextOpenHouse(state: GameState): string {
  const showroom = state.showroom;
  if (showroom === null) return "";
  const day = seasonDay(showroom, state.calendar.day);
  if (day === null) return `Open House starts in season ${showroom.seasonNumber}.`;
  if (showroom.rested) return "No Open House while the shop rests.";
  const next = day <= 7 ? 7 : 14;
  const inDays = next - day;
  return inDays === 0
    ? "Open House is tonight!"
    : `Open House in ${inDays} ${inDays === 1 ? "day" : "days"}.`;
}

function SetRow({
  state,
  set,
  dispatch,
}: {
  state: GameState;
  set: FloorSet;
  dispatch: (action: Action) => boolean;
}) {
  const fair = state.fair;
  const saved = fair !== null && fair.result === null && fair.pickSetId === set.setId;
  const sale = openHouseSale(state);
  const goingHome = sale?.setId === set.setId;
  const rosette = fair?.rosettesBySet[set.setId];
  const onRug = isOnOwnRug(set, rugsFor(bayCount(state)));
  return (
    <li className="ww-floor-set" data-testid={`floor-${set.setId}`}>
      <SetPreview
        looks={floorLooks(set)}
        title={setTemplateById(set.templateId).name}
        className="ww-floor-set__art"
      />
      <div className="ww-floor-set__body">
        <strong>{setTemplateById(set.templateId).name}</strong>
        <span className="ww-floor-set__facts">
          <span>
            <Icon name="star" size={14} /> Quality {set.stats.quality}
          </span>
          <span>
            <Icon name="coin" size={14} /> {set.price}
          </span>
          {rosette !== undefined ? <TagPill tone="sage">{rosetteById(rosette).name}</TagPill> : null}
          {saved ? <TagPill tone="hot">Saved for the Fair</TagPill> : null}
          {goingHome ? <TagPill tone="sage">Goes home at Open House</TagPill> : null}
          {onRug ? null : <TagPill tone="plain">Off its rug</TagPill>}
        </span>
        <div
          className="ww-floor-set__modes"
          role="radiogroup"
          aria-label={`${setTemplateById(set.templateId).name} on the floor`}
        >
          <button
            type="button"
            role="radio"
            aria-checked={set.mode === "sale"}
            className="ww-floor-set__mode"
            onClick={() => dispatch({ type: "markFloorSet", setId: set.setId, mode: "sale" })}
          >
            For sale
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={set.mode === "show"}
            className="ww-floor-set__mode"
            onClick={() => dispatch({ type: "markFloorSet", setId: set.setId, mode: "show" })}
          >
            Keep on show
          </button>
        </div>
        {set.mode === "sale" && !saved && !goingHome ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: "pickOpenHouse", setId: set.setId })}
            data-testid={`sell-${set.setId}`}
          >
            Sell this one at Open House
          </Button>
        ) : null}
      </div>
    </li>
  );
}

export function ShowroomFloorCard({ state, dispatch, onArrange }: ShowroomFloorCardProps) {
  const showroom = state.showroom;
  if (state.career !== "showroom" || showroom === null) return null;
  const bays = bayCount(state);
  return (
    <Card
      title="The showroom floor"
      eyebrow={`${showroom.floor.length} of ${bays} bays filled`}
      className="ww-hub-card ww-floor-card"
      data-testid="showroom-floor"
      actions={
        <Button
          size="sm"
          variant="secondary"
          onClick={onArrange}
          disabledReason={showroom.floor.length === 0 ? "Finish a set first." : undefined}
          data-testid="arrange-floor"
        >
          Arrange the floor
        </Button>
      }
    >
      <p className="ww-hint">
        <Icon name="home" size={14} /> {nextOpenHouse(state)} At most one set For sale goes home each Open
        House.
      </p>
      {showroom.floor.length === 0 ? (
        <p className="ww-muted">Empty rugs, waiting for your first matched set. {SET_HINTS.rug}</p>
      ) : (
        <ul className="ww-floor-sets">
          {showroom.floor.map((set) => (
            <SetRow key={set.setId} state={state} set={set} dispatch={dispatch} />
          ))}
        </ul>
      )}
    </Card>
  );
}

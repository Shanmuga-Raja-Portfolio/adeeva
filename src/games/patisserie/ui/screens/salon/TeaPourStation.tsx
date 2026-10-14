import { useRef, useState, type PointerEvent } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { TICK_SECONDS, useTickLoop } from "../../../../../ui/kit/useTickLoop";
import type { TeaDef } from "../../../content/tea";
import { MAX_POUR_ML, pourAccuracy, TEA_TARGET_ML, type Action } from "../../../core";
import type { TableState } from "../../../core";
import { TeaPourScene } from "../../art/TeaPourScene";
import { FRESH_POUR, pourTick, releasePour, settled, startPour, type PourState } from "../bake/weighPour";

export interface TeaPourStationProps {
  readonly tableIndex: number;
  readonly tea: TeaDef;
  readonly band: number;
  readonly assisted: boolean;
  readonly stored: TableState["pour"];
  readonly dispatch: (action: Action) => boolean;
}

const MAX_ACTIONS = 40;

function verdict(accuracy: number): string {
  if (accuracy >= 0.99) return "Right on the line!";
  if (accuracy >= 0.8) return "A lovely cup.";
  if (accuracy >= 0.5) return "A little off the line, still warm and welcome.";
  return "Quite far from the line. Pour again?";
}

export function TeaPourStation({ tableIndex, tea, band, assisted, stored, dispatch }: TeaPourStationProps) {
  const [pour, setPour] = useState<PourState>(() =>
    stored === null
      ? FRESH_POUR
      : { ...FRESH_POUR, grams: stored.ml, actions: stored.actions, helped: stored.assisted },
  );
  const pourRef = useRef(pour);
  const setup = { target: TEA_TARGET_ML, stock: MAX_POUR_ML, pourDifficulty: tea.pourDifficulty, assisted };
  const moving = pour.holding || pour.settleLeft > 0;
  const update = (next: PourState) => {
    pourRef.current = next;
    setPour(next);
  };
  useTickLoop(moving, (count) => {
    let next = pourRef.current;
    for (let tick = 0; tick < count; tick += 1) next = pourTick(next, setup, TICK_SECONDS);
    update(next);
    return next.holding || next.settleLeft > 0;
  });
  const press = (event: PointerEvent<HTMLButtonElement>) => {
    if (pourRef.current.emptied || pourRef.current.actions >= MAX_ACTIONS) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(startPour(pourRef.current));
  };
  const lift = () => update(releasePour(pourRef.current, setup));
  const ml = Math.round(pour.grams);
  const record = {
    ml,
    actions: Math.max(1, Math.min(MAX_ACTIONS, pour.actions)),
    assisted: assisted || pour.helped,
  };
  const accuracy = pourAccuracy({ ...record, band });
  const ready = settled(pour) && ml > 0 && pour.actions > 0;
  const kept = stored !== null && stored.ml === ml && stored.actions === record.actions;
  return (
    <div className="pa-tea" data-testid="tea-station">
      <TeaPourScene
        ml={pour.grams}
        target={TEA_TARGET_ML}
        capacity={MAX_POUR_ML}
        band={band}
        tea={tea.colour}
        pouring={pour.holding}
        showBand={assisted || ready}
      />
      <div className="pa-tea__controls">
        <strong>{tea.name}</strong>
        <button
          type="button"
          className={pour.holding ? "pa-pour-pad pa-pour-pad--pouring" : "pa-pour-pad"}
          onPointerDown={press}
          onPointerUp={lift}
          onPointerCancel={lift}
          onBlur={lift}
          onKeyDown={(event) => {
            if ((event.key === " " || event.key === "Enter") && !event.repeat)
              update(startPour(pourRef.current));
          }}
          onKeyUp={(event) => {
            if (event.key === " " || event.key === "Enter") lift();
          }}
          disabled={pour.emptied}
          data-testid="tea-pad"
        >
          <span className="pa-pour-pad__scoop pa-pour-pad__scoop--tea" aria-hidden="true" />
          {pour.holding ? "Pouring…" : "Hold to pour"}
        </button>
        {pour.settleLeft > 0 ? <p className="pa-hint">The pot keeps dripping after you let go!</p> : null}
        {pour.emptied ? <p className="pa-hint">The cup is full to the brim!</p> : null}
        <div className="pa-tea__row">
          <Button variant="secondary" onClick={() => update(FRESH_POUR)} disabled={moving || ml === 0}>
            Pour again
          </Button>
          <Button
            onClick={() => dispatch({ type: "pourTea", tableIndex, ...record })}
            disabled={!ready || kept}
            data-testid="keep-tea"
          >
            {kept ? "Cup kept" : `Keep ${ml} ml`}
          </Button>
        </div>
        {ready ? (
          <p className="pa-tea__verdict" aria-live="polite">
            {verdict(accuracy)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

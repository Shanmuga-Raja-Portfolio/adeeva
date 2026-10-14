import { useRef, useState, type PointerEvent } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { TICK_SECONDS, useTickLoop } from "../../../../../ui/kit/useTickLoop";
import type { IngredientDef } from "../../../content/ingredient";
import {
  pourCap,
  scoopBackGrams,
  weighAccuracy,
  type Action,
  type WeighAttempt,
  type WeighRecord,
} from "../../../core";
import { DialScale } from "../../art/DialScale";
import { IngredientPack } from "../../art/IngredientPack";
import { FRESH_POUR, pourTick, releasePour, settled, startPour, type PourState } from "./weighPour";

export interface WeighStationProps {
  readonly batch: number;
  readonly ingredient: IngredientDef;
  readonly target: number;
  readonly stock: number;
  readonly band: number;
  readonly assisted: boolean;
  readonly covered: boolean;
  readonly stored: WeighRecord | undefined;
  readonly dispatch: (action: Action) => boolean;
  readonly onKept: () => void;
  readonly onNeedPantry: () => void;
}

function verdict(accuracy: number): string {
  if (accuracy >= 0.99) return "Spot on!";
  if (accuracy >= 0.8) return "Lovely and close.";
  if (accuracy >= 0.5) return "A little off, but it will bake.";
  return "Quite a way off. Scoop back or keep going?";
}

export function WeighStation({
  batch,
  ingredient,
  target,
  stock,
  band,
  assisted,
  covered,
  stored,
  dispatch,
  onKept,
  onNeedPantry,
}: WeighStationProps) {
  const [pour, setPour] = useState<PourState>(() =>
    stored === undefined
      ? FRESH_POUR
      : { ...FRESH_POUR, grams: stored.grams, actions: stored.actions, helped: stored.assisted },
  );
  const pourRef = useRef(pour);
  const setup = { target, stock, pourDifficulty: ingredient.pourDifficulty, assisted };
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
    if (pourRef.current.emptied || pourRef.current.actions >= 40) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(startPour(pourRef.current));
  };
  const lift = () => update(releasePour(pourRef.current, setup));
  const addPiece = () => {
    const current = pourRef.current;
    const cap = pourCap(target, stock);
    if (current.grams + ingredient.pieceGrams > cap) {
      if (stock < 3 * target) onNeedPantry();
      return;
    }
    update({ ...current, grams: current.grams + ingredient.pieceGrams, actions: current.actions + 1 });
  };
  const scoopBack = () => {
    const current = pourRef.current;
    const grams = Math.max(0, current.grams - scoopBackGrams(ingredient, target));
    update({
      ...current,
      grams,
      actions: current.actions + 1,
      emptied: false,
      helped: grams > 0 && current.helped,
    });
  };
  const grams = Math.round(pour.grams);
  const record: WeighAttempt = {
    grams,
    actions: Math.max(1, Math.min(40, pour.actions)),
    assisted: assisted || pour.helped,
  };
  const accuracy = weighAccuracy(record, ingredient, target, band);
  const canKeep = settled(pour) && grams > 0 && pour.actions > 0;
  const keep = () => {
    if (dispatch({ type: "recordWeigh", batch, ingredientId: ingredient.id, ...record })) onKept();
  };
  const unit = ingredient.mode === "piece" && ingredient.pieceGrams === 1 ? "drops" : "g";
  return (
    <div className="pa-weigh-station" data-testid="weigh-station" data-ingredient={ingredient.id}>
      <div className="pa-weigh-station__scale">
        <DialScale
          grams={pour.grams}
          target={target}
          band={band}
          colour={ingredient.colour}
          stopLine={assisted}
          pouring={pour.holding}
          unit={unit}
          hideZone={covered && (moving || pour.actions === 0)}
        />
      </div>
      <div className="pa-weigh-station__controls">
        <div className="pa-weigh-station__target">
          <IngredientPack ingredient={ingredient} size={56} />
          <div>
            <strong>{ingredient.name}</strong>
            <span>
              Aim for{" "}
              <b>
                {target} {unit}
              </b>
            </span>
          </div>
        </div>
        {ingredient.mode === "pour" ? (
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
            data-testid="pour-pad"
          >
            <span className="pa-pour-pad__scoop" aria-hidden="true" />
            {pour.holding ? "Pouring…" : "Hold to pour"}
          </button>
        ) : (
          <button
            type="button"
            className="pa-pour-pad pa-pour-pad--piece"
            onClick={addPiece}
            data-testid="piece-pad"
          >
            {ingredient.id === "butter" ? "Add a 25 g slice" : "Add a drop"}
          </button>
        )}
        {pour.settleLeft > 0 ? <p className="pa-hint">The scale keeps going after you let go!</p> : null}
        {pour.emptied ? (
          <p className="pa-weigh-station__empty" role="status">
            The bag is empty! Buy more in the pantry.{" "}
            <Button size="sm" variant="secondary" onClick={onNeedPantry}>
              Back to pantry
            </Button>
          </p>
        ) : null}
        <div className="pa-weigh-station__row">
          <Button
            variant="secondary"
            onClick={scoopBack}
            disabled={pour.grams <= 0 || moving}
            className="pa-scoop-back"
          >
            Scoop back
          </Button>
          <Button onClick={keep} disabled={!canKeep} data-testid="keep-weigh">
            Keep {grams} {unit}
          </Button>
        </div>
        {canKeep ? (
          <p
            className={
              accuracy >= 0.99
                ? "pa-weigh-station__verdict pa-weigh-station__verdict--great"
                : "pa-weigh-station__verdict"
            }
            aria-live="polite"
          >
            {verdict(accuracy)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

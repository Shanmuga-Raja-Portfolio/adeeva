import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { ToggleSwitch } from "../../../../../ui/kit/ToggleSwitch";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import type { IngredientId } from "../../../content/ingredient";
import {
  batchMix,
  batchName,
  batchReady,
  ingredientById,
  productById,
  weighAccuracy,
  weighBand,
} from "../../../core";
import { useAssist } from "../../useAssist";
import { PantryDialog } from "./PantryDialog";
import { StageFooter } from "./StageFooter";
import { assistHint, SAFETY_LINE } from "./stageNames";
import type { StageProps } from "./stageProps";
import { WeighStation } from "./WeighStation";
import "./weigh.css";

export function WeighStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const once = useDispatchOnce(state, dispatch);
  const [assist, setAssist] = useAssist("weigh");
  const [pantryOpen, setPantryOpen] = useState(false);
  const firstOpen = Math.max(
    0,
    run.batches.findIndex((entry) => !entry.committed),
  );
  const [batch, setBatch] = useState(firstOpen);
  const mix = batchMix(run, batch);
  const entry = run.batches[batch];
  const band = weighBand(state);
  const firstMissing = mix?.weighed.find(
    (amount) => entry?.weighs[amount.ingredient] === undefined,
  )?.ingredient;
  const [picked, setPicked] = useState<IngredientId | null>(firstMissing ?? null);
  const current = picked ?? firstMissing ?? mix?.weighed[0]?.ingredient ?? null;
  if (mix === null || entry === undefined || run.design.productId === null) return null;
  const product = productById(run.design.productId);
  const struggling = mix.weighed.some((item) => {
    const record = entry.weighs[item.ingredient];
    return (
      record !== undefined &&
      weighAccuracy(record, ingredientById(item.ingredient), item.grams, record.band) < 0.8
    );
  });
  const amount = mix.weighed.find((item) => item.ingredient === current);
  const nextMissing = (after: IngredientId) =>
    mix.weighed.find((item) => item.ingredient !== after && entry.weighs[item.ingredient] === undefined)
      ?.ingredient ?? null;
  return (
    <div className="pa-weigh">
      {run.batches.length > 1 ? (
        <div className="pa-weigh__tabs" role="tablist" aria-label="Batches">
          {run.batches.map((item, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === batch}
              className="pa-weigh__tab"
              onClick={() => {
                setBatch(index);
                setPicked(null);
              }}
            >
              {batchName(product, index)} {item.committed ? <Icon name="check" size={14} /> : null}
            </button>
          ))}
        </div>
      ) : null}
      <div className="pa-weigh__layout">
        <aside className="pa-weigh__list pa-doily">
          <h2>{mix.name}</h2>
          <ul>
            {mix.weighed.map((item) => {
              const record = entry.weighs[item.ingredient];
              const ingredient = ingredientById(item.ingredient);
              return (
                <li key={item.ingredient}>
                  <button
                    type="button"
                    className={
                      item.ingredient === current ? "pa-weigh__item pa-weigh__item--active" : "pa-weigh__item"
                    }
                    onClick={() => setPicked(item.ingredient)}
                    disabled={entry.committed}
                    aria-pressed={item.ingredient === current}
                  >
                    <span className="pa-weigh__dot" style={{ background: ingredient.colour }} />
                    <span>{ingredient.name}</span>
                    <span className="pa-weigh__grams">
                      {record === undefined
                        ? `${item.grams} g`
                        : `${record.grams} g · ${Math.round(weighAccuracy(record, ingredient, item.grams, record.band) * 100)}%`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="pa-eggs">
            <span className="pa-eggs__head">
              <strong>Eggs</strong>
              <span className="pa-eggs__count">
                {entry.eggs}/{mix.eggs}
              </span>
              {entry.eggs < mix.eggs && !entry.committed ? (
                <span className="pa-eggs__tip">Tap to crack!</span>
              ) : null}
            </span>
            <div className="pa-eggs__row">
              {Array.from({ length: mix.eggs }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={
                    index < entry.eggs
                      ? "pa-egg pa-egg--cracked"
                      : index === entry.eggs && !entry.committed
                        ? "pa-egg pa-egg--next"
                        : "pa-egg"
                  }
                  disabled={index !== entry.eggs || entry.committed}
                  onClick={(event) => once(event, { type: "crackEgg", batch })}
                  aria-label={index < entry.eggs ? "Egg cracked" : "Tap to crack an egg"}
                  data-testid="crack-egg"
                >
                  <span aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
          {entry.committed ? (
            <p className="pa-weigh__done">
              <Icon name="check" size={16} /> In the bowl!
            </p>
          ) : (
            <Button
              block
              onClick={(event) => {
                if (once(event, { type: "commitBatch", batch })) {
                  const nextBatch = run.batches.findIndex(
                    (item, index) => index !== batch && !item.committed,
                  );
                  if (nextBatch >= 0) {
                    setBatch(nextBatch);
                    setPicked(null);
                  }
                }
              }}
              disabledReason={
                batchReady(entry, mix, state.pantry) ? undefined : "Weigh all four and crack the eggs first."
              }
              data-testid="commit-batch"
            >
              Into the bowl
            </Button>
          )}
          <ToggleSwitch
            label="Scale helper"
            description="A stop line, and the pour stops by itself. Counts up to 80%."
            checked={assist}
            onChange={setAssist}
          />
          {struggling && !assist ? <p className="pa-hint">{assistHint("Scale helper")}</p> : null}
        </aside>
        <div className="pa-weigh__bench">
          {amount !== undefined && !entry.committed ? (
            <WeighStation
              key={`${batch}-${amount.ingredient}-${assist ? "a" : "m"}`}
              batch={batch}
              ingredient={ingredientById(amount.ingredient)}
              target={amount.grams}
              stock={state.pantry.ingredients[amount.ingredient]}
              band={band}
              assisted={assist}
              covered={run.flourishes.includes("blind-scale")}
              stored={entry.weighs[amount.ingredient]}
              dispatch={dispatch}
              onKept={() => setPicked(nextMissing(amount.ingredient))}
              onNeedPantry={() => setPantryOpen(true)}
            />
          ) : (
            <div className="pa-weigh__bowl-done">
              <p>
                {entry.committed ? "This batch is in the bowl. Lovely!" : "Pick an ingredient from the list."}
              </p>
            </div>
          )}
          <p className="pa-safety pa-safety--quiet">
            <Icon name="shield" size={14} /> {SAFETY_LINE}
          </p>
        </div>
      </div>
      <PantryDialog
        open={pantryOpen}
        onClose={() => setPantryOpen(false)}
        state={state}
        run={run}
        dispatch={dispatch}
      />
      <StageFooter {...props} ready="Everything's in the bowl. Grab a spoon!" />
    </div>
  );
}

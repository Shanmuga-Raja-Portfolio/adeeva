import { Button } from "../../../../../ui/kit/Button";
import { Meter } from "../../../../../ui/kit/Meter";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { canDeliver, findById, flipQuality, leavesOf, mainFind, recipeById } from "../../../core";
import { findCloth } from "../../art/findCloth";
import { LeafMeter } from "../../art/LeafMeter";
import { ProductPreview } from "../../art/ProductPreview";
import { QUALITY_LABELS, QUALITY_ORDER } from "./qualityTerms";
import type { StageProps } from "./stageProps";

export function ReviewStage({ state, run, dispatch }: StageProps) {
  const once = useDispatchOnce(state, dispatch);
  const main = mainFind(run);
  const cloth = main === null ? null : findCloth(findById(main.findId));
  const quality = flipQuality(state, run);
  const leaves = leavesOf(run, state.upgrades.includes("sharp-ripper"));
  const check = canDeliver(state);
  const own = run.brief === null;
  const name = run.design.recipeId === null ? "Your flip" : recipeById(run.design.recipeId).name;
  return (
    <div className="tf-review">
      <div className="tf-review__stage">
        <ProductPreview
          design={run.design}
          cloth={cloth}
          finishes={run.finishes}
          title={`Your finished ${name}`}
          className="tf-review__art"
        />
      </div>
      <div className="tf-review__card">
        <h2>{name}</h2>
        <div className="tf-review__meters">
          {QUALITY_ORDER.map((term) => (
            <Meter
              key={term}
              label={QUALITY_LABELS[term]}
              value={Math.round(quality[term] * 100)}
              valueText={`${Math.round(quality[term] * 100)}%`}
              tone={quality[term] >= 0.8 ? "sage" : "gold"}
            />
          ))}
        </div>
        <p className="tf-review__quality">
          Quality <strong>{quality.quality}</strong>
        </p>
        <LeafMeter leaves={leaves.leaves} />
        <Button
          size="lg"
          block
          icon={own ? "hanger" : "heart"}
          onClick={(event) => once(event, { type: "deliver" })}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          data-testid="deliver"
        >
          {own ? "Hang it on the stall rack" : "Hand it over"}
        </Button>
      </div>
    </div>
  );
}

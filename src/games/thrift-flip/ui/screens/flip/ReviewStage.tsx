import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../ui/kit/Meter";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import {
  canDeliver,
  findById,
  flipQuality,
  leavesOf,
  mainFind,
  qualityWeights,
  recipeById,
  runKind,
} from "../../../core";
import { FindArt } from "../../art/FindArt";
import { findCloth } from "../../art/findCloth";
import { LeafMeter } from "../../art/LeafMeter";
import { ProductPreview } from "../../art/ProductPreview";
import { QUALITY_LABELS, QUALITY_ORDER } from "./qualityTerms";
import type { StageProps } from "./stageProps";

export function ReviewStage({ state, run, dispatch }: StageProps) {
  const once = useDispatchOnce(state, dispatch);
  const main = mainFind(run);
  const find = main === null ? null : findById(main.findId);
  const cloth = find === null ? null : findCloth(find);
  const quality = flipQuality(state, run);
  const weights = qualityWeights(run);
  const leaves = leavesOf(run, state.upgrades.includes("sharp-ripper"));
  const check = canDeliver(state);
  const own = run.brief === null;
  const ticket = runKind(run) !== "flip";
  const name =
    ticket && run.brief !== null
      ? run.brief.occasion
      : run.design.recipeId === null
        ? "Your flip"
        : recipeById(run.design.recipeId).name;
  const rackName =
    state.profile.career === "boutique" ? "Hang it on the seasonal rack" : "Hang it on the stall rack";
  return (
    <div className="tf-review">
      <div className="tf-review__stage">
        {ticket && find !== null ? (
          <FindArt
            find={find}
            grade="like-new"
            mended
            size={280}
            title={`${find.name}, mended`}
            className="tf-review__art"
          />
        ) : (
          <ProductPreview
            design={run.design}
            cloth={cloth}
            finishes={run.finishes}
            title={`Your finished ${name}`}
            className="tf-review__art"
          />
        )}
      </div>
      <div className="tf-review__card">
        <h2>{name}</h2>
        <div className="tf-review__meters">
          {QUALITY_ORDER.filter((term) => weights[term] > 0).map((term) => (
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
        {ticket ? (
          <TagPill tone="sage">
            <Icon name="heart" size={12} /> Things saved +1
          </TagPill>
        ) : (
          <LeafMeter leaves={leaves.leaves} />
        )}
        <Button
          size="lg"
          block
          icon={own ? "hanger" : "heart"}
          onClick={(event) => once(event, { type: "deliver" })}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          data-testid="deliver"
        >
          {own ? rackName : ticket ? "Hand it back" : "Hand it over"}
        </Button>
      </div>
    </div>
  );
}

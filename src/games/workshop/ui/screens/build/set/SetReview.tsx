import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { Meter } from "../../../../../../ui/kit/Meter";
import { useDispatchOnce } from "../../../../../../ui/kit/useDispatchOnce";
import {
  canFinishSet,
  checklist,
  constructionCount,
  matchedFaces,
  matchingHardware,
  pieceQualities,
  runPieces,
  setEvenness,
  setQuality,
  setTemplateById,
} from "../../../../core";
import { setLooks } from "../../../art/pieceLook";
import { SetPreview } from "../../../art/SetPreview";
import type { StageProps } from "../stageProps";
import "../review/review.css";

export function SetReview({ state, run, dispatch }: StageProps) {
  const once = useDispatchOnce(state, dispatch);
  const purpose = run.purpose;
  if (purpose.kind !== "set") return null;
  const check = canFinishSet(state);
  const template = setTemplateById(purpose.templateId);
  const count = constructionCount(state, run);
  const items = checklist(state, run);
  const qualities = pieceQualities(state, run);
  const faces = matchedFaces(run);
  const hardware = matchingHardware(run);
  const evenness = setEvenness(qualities);
  return (
    <div className="ww-review ww-review--set">
      <div className="ww-review__piece">
        <div className="ww-review__spot" aria-hidden="true" />
        <SetPreview
          looks={setLooks(run)}
          title={`The finished ${template.name}`}
          className="ww-review__set"
          threeQuarter
        />
      </div>
      <div className="ww-review__side">
        <div className="ww-review__card ww-paper ww-tape">
          <span className="ad-eyebrow">Ready for the showroom floor</span>
          <h2>{template.name}</h2>
          <ul className="ww-review__build">
            <li>
              <Icon name="check" size={16} /> {count.sawn}/{count.parts} parts sawn
            </li>
            <li>
              <Icon name="star" size={16} /> {count.seated}/{count.joints} joints tapped home
            </li>
            <li>
              <Icon name="sparkle" size={16} /> {count.sanded}/{count.surfaces} surfaces sanded
            </li>
          </ul>
          <div className="ww-review__meters">
            {runPieces(run).map((piece) => (
              <Meter
                key={piece.index}
                label={piece.name}
                tone="gold"
                value={qualities[piece.index] ?? 0}
                valueText={`Quality ${qualities[piece.index] ?? 0}`}
              />
            ))}
            <Meter label="Even shine" tone="sage" value={evenness} valueText={String(evenness)} />
            {faces === null ? null : (
              <Meter
                label="Matched faces"
                tone="ink"
                value={Math.round(faces * 100)}
                valueText={`${Math.round(faces * 100)}%`}
              />
            )}
            <Meter label="Matching hardware" tone="rose" value={hardware} valueText={String(hardware)} />
          </div>
          <ul className="ww-review__checks">
            {items.map((item) => (
              <li key={item.id} className={`ww-review__check ww-review__check--${item.status}`}>
                <span aria-hidden="true">
                  {item.status === "met" ? "✓" : item.status === "unmet" ? "!" : "·"}
                </span>{" "}
                {item.label}
              </li>
            ))}
          </ul>
          <p className="ww-muted">
            Set quality {setQuality(state, run)}. The price is set when it reaches the floor.
          </p>
        </div>
        <Button
          size="lg"
          block
          icon="home"
          onClick={(event) => once(event, { type: "finishSet" })}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          showReason
          data-testid="finish-set"
        >
          Put it on the showroom floor
        </Button>
      </div>
    </div>
  );
}

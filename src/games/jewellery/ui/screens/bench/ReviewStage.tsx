import { Button } from "../../../../../ui/kit/Button";
import { Meter } from "../../../../../ui/kit/Meter";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { canDeliver, pieceQuality, productById, runSource } from "../../../core";
import { GiftBox } from "../../art/GiftBox";
import { PiecePreview } from "../../art/PiecePreview";
import { qualityRows } from "./qualityRows";
import type { StageProps } from "./stageProps";
import "./review.css";

export function ReviewStage({ state, run, dispatch }: StageProps) {
  const once = useDispatchOnce(state, dispatch);
  const quality = pieceQuality(state, run);
  const check = canDeliver(state);
  const product = productById(run.design.productId);
  return (
    <div className="jb-review">
      <div className="jb-review__box">
        <svg viewBox="0 0 240 240" className="jb-review__gift" aria-hidden="true">
          <GiftBox open />
        </svg>
        <PiecePreview
          source={runSource(run)}
          title={`Your ${product.name}`}
          twinkle
          className="jb-review__piece"
        />
      </div>
      <section className="jb-review__panel jb-measure">
        <h2>How it turned out</h2>
        {qualityRows(quality).map((row) => (
          <Meter
            key={row.label}
            label={row.label}
            value={Math.round(row.value * 100)}
            max={100}
            valueText={`${Math.round(row.value * 100)}%`}
            tone="sage"
          />
        ))}
        <Meter
          label="Quality"
          value={quality.quality}
          max={100}
          valueText={`${quality.quality} / 100`}
          tone="gold"
        />
        <Button
          size="lg"
          icon="heart"
          onClick={(event) => once(event, { type: "deliver" })}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          showReason
          data-testid="deliver"
        >
          Tie the ribbon and deliver
        </Button>
      </section>
    </div>
  );
}

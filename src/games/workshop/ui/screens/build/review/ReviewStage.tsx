import { Avatar } from "../../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../../ui/kit/Button";
import { Icon } from "../../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../../ui/kit/useDispatchOnce";
import { canDeliver, checklist, clientById, constructionCount, productById } from "../../../../core";
import { PiecePreview } from "../../../art/PiecePreview";
import { pieceLook } from "../../../art/pieceLook";
import type { StageProps } from "../stageProps";
import "./review.css";

export function ReviewStage({ state, run, dispatch }: StageProps) {
  const once = useDispatchOnce(state, dispatch);
  const check = canDeliver(state);
  const client = clientById(run.brief.clientId);
  const look = pieceLook(run);
  const count = constructionCount(state, run);
  const items = checklist(state, run);
  if (look === null || run.design.productId === null) return null;
  return (
    <div className="ww-review">
      <div className="ww-review__piece">
        <div className="ww-review__spot" aria-hidden="true" />
        <PiecePreview
          look={look}
          title={`The finished ${productById(run.design.productId).name}`}
          className="ww-review__art"
          threeQuarter
        />
      </div>
      <div className="ww-review__side">
        <div className="ww-review__card ww-paper ww-tape">
          <div className="ww-review__who">
            {client !== undefined ? (
              <Avatar look={client.look} mood="thinking" size={72} title={client.name} />
            ) : null}
            <div>
              <span className="ad-eyebrow">Ready to deliver</span>
              <h2>{client !== undefined ? `Ready for ${client.name}?` : "Ready to go?"}</h2>
            </div>
          </div>
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
          <p className="ww-muted">The stars are revealed when they see it in its new home.</p>
        </div>
        <Button
          size="lg"
          block
          icon="heart"
          onClick={(event) => once(event, { type: "deliver" })}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          showReason
          data-testid="deliver"
        >
          Deliver it
        </Button>
      </div>
    </div>
  );
}

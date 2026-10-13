import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { canDeliver, checklist, clientById, constructionCount, productById } from "../../../core";
import { BakePreview } from "../../art/BakePreview";
import { bakeLook } from "../../art/bakeLook";
import type { StageProps } from "./stageProps";
import "./review.css";

export function ReviewStage({ state, run, dispatch }: StageProps) {
  const once = useDispatchOnce(state, dispatch);
  const check = canDeliver(state);
  const look = bakeLook(run.design, run.toppings, run.purpose.kind === "order");
  const count = constructionCount(run);
  const client = run.brief === null ? undefined : clientById(run.brief.clientId);
  const items = checklist(state, run);
  if (look === null || run.design.productId === null) return null;
  return (
    <div className="pa-review">
      <div className="pa-review__bake">
        <div className="pa-review__spot" aria-hidden="true" />
        <BakePreview
          look={look}
          title={`The finished ${productById(run.design.productId).name}`}
          className="pa-review__art"
        />
      </div>
      <div className="pa-review__side">
        <div className="pa-review__card pa-doily">
          <div className="pa-review__who">
            {client !== undefined ? (
              <Avatar look={client.look} mood="thinking" size={72} title={client.name} />
            ) : null}
            <div>
              <span className="ad-eyebrow">
                {run.purpose.kind === "order" ? "Ready to box" : "Counter tray"}
              </span>
              <h2>{client !== undefined ? `Ready for ${client.name}?` : "Six treats for Counter Day"}</h2>
            </div>
          </div>
          <ul className="pa-review__build">
            <li>
              <Icon name="check" size={16} /> {count.weighed}/{count.batches} weighed and stirred
            </li>
            <li>
              <Icon name="clock" size={16} /> {count.baked}/{count.batches} baked
            </li>
            {run.purpose.kind === "order" ? (
              <>
                <li>
                  <Icon name="sparkle" size={16} /> {count.piped}/{count.paths} icing lines piped
                </li>
                <li>
                  <Icon name="heart" size={16} /> {run.toppings.length} toppings
                </li>
              </>
            ) : null}
          </ul>
          {items.length > 0 ? (
            <ul className="pa-review__checks">
              {items.map((item) => (
                <li key={item.id} className={`pa-review__check pa-review__check--${item.status}`}>
                  <span aria-hidden="true">
                    {item.status === "met" ? "✓" : item.status === "unmet" ? "!" : "·"}
                  </span>{" "}
                  {item.label}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="pa-muted">
            {run.purpose.kind === "order"
              ? "The stars are revealed when they open the box."
              : "Trays sell on Counter Day, day 7 of the week."}
          </p>
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
          {run.purpose.kind === "order" ? "Deliver the box" : "Put the tray on the counter"}
        </Button>
      </div>
    </div>
  );
}

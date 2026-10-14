import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import {
  canDeliver,
  checklist,
  clientById,
  constructionCount,
  isCustomBake,
  productById,
  type BakeRun,
} from "../../../core";

const REVIEW_COPY: Readonly<
  Record<BakeRun["purpose"]["kind"], { eyebrow: string; button: string; note: string }>
> = {
  order: {
    eyebrow: "Ready to box",
    button: "Deliver the box",
    note: "The stars are revealed when they open the box.",
  },
  showpiece: {
    eyebrow: "Ready for the Fair",
    button: "Take to the Fair",
    note: "The panels see it on Fair Day. Ready or not, the Fair is glad to see you.",
  },
  "salon-tray": {
    eyebrow: "Salon tray",
    button: "Put it on the Salon shelf",
    note: "Salon trays wait on the shelf for Salon Day.",
  },
  tray: {
    eyebrow: "Counter tray",
    button: "Put the tray on the counter",
    note: "Trays sell on Counter Day, day 7 of the week.",
  },
};
import { BakePreview } from "../../art/BakePreview";
import { bakeLook } from "../../art/bakeLook";
import type { StageProps } from "./stageProps";
import "./review.css";

export function ReviewStage({ state, run, dispatch }: StageProps) {
  const once = useDispatchOnce(state, dispatch);
  const check = canDeliver(state);
  const look = bakeLook(run.design, run.toppings, run.purpose.kind !== "tray");
  const copy = REVIEW_COPY[run.purpose.kind];
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
          plaque={run.word}
        />
      </div>
      <div className="pa-review__side">
        <div className="pa-review__card pa-doily">
          <div className="pa-review__who">
            {client !== undefined ? (
              <Avatar look={client.look} mood="thinking" size={72} title={client.name} />
            ) : null}
            <div>
              <span className="ad-eyebrow">{copy.eyebrow}</span>
              <h2>
                {client !== undefined
                  ? `Ready for ${client.name}?`
                  : run.purpose.kind === "showpiece"
                    ? "Your Fair showpiece"
                    : run.purpose.kind === "salon-tray"
                      ? "Six treats for the Comet Room"
                      : "Six treats for Counter Day"}
              </h2>
            </div>
          </div>
          <ul className="pa-review__build">
            <li>
              <Icon name="check" size={16} /> {count.weighed}/{count.batches} weighed and stirred
            </li>
            <li>
              <Icon name="clock" size={16} /> {count.baked}/{count.batches} baked
            </li>
            {isCustomBake(run) ? (
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
          <p className="pa-muted">{copy.note}</p>
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
          {copy.button}
        </Button>
      </div>
    </div>
  );
}

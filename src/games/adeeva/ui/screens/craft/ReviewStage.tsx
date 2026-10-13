import { canDeliver, checklist, constructionCount, snapshotRun } from "../../../core";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { DressPreview } from "../../art/DressPreview";
import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { briefOwner } from "./briefOwner";
import { designFabrics, designParts } from "../../art/designLook";
import type { StageProps } from "./stageProps";
import "./review.css";

export function ReviewStage({ state, run, dispatch }: StageProps) {
  const once = useDispatchOnce(state, dispatch);
  const check = canDeliver(state);
  const items = checklist(state);
  const count = constructionCount(snapshotRun(run));
  const { client, theme } = briefOwner(run.brief);
  const unmet = items.filter((item) => item.status === "unmet").length;
  return (
    <div className="ad-review-stage">
      <div className="ad-review-stage__dress">
        <div className="ad-review-stage__spot" aria-hidden="true" />
        <DressPreview
          parts={designParts(run.design)}
          fabrics={designFabrics(run.design)}
          trims={run.decorations}
          title="The finished dress"
          className="ad-review-stage__preview"
        />
      </div>
      <div className="ad-review-stage__side">
        <Card tone="gold" className="ad-review-card">
          <div className="ad-review-card__who">
            {client !== undefined ? <Avatar look={client.look} mood="thinking" size={72} /> : null}
            <div>
              <span className="ad-eyebrow">Final fitting</span>
              <h2>
                {client !== undefined
                  ? `Ready for ${client.name}?`
                  : `Ready for ${theme?.name ?? "the show"}?`}
              </h2>
            </div>
          </div>
          <ul className="ad-review-build">
            <li>
              <Icon name="scissors" size={18} /> {count.piecesCut}/{count.piecesTotal} panels cut
            </li>
            <li>
              <Icon name="hanger" size={18} /> {count.piecesAssembled}/{count.piecesTotal} on the form
            </li>
            <li>
              <Icon name="needle" size={18} /> {count.seamsSewn}/{count.seamsTotal} seams sewn
            </li>
            <li>
              <Icon name="sparkle" size={18} /> {run.decorations.length} trims placed
            </li>
          </ul>
        </Card>
        <Card title="Against the brief" className="ad-review-checklist">
          <ul>
            {items.map((item) => (
              <li key={item.id} className={`ad-review-check ad-review-check--${item.status}`}>
                <span className="ad-review-check__mark" aria-hidden="true">
                  {item.status === "met" ? (
                    <Icon name="check" size={14} />
                  ) : item.status === "unmet" ? (
                    "!"
                  ) : (
                    "·"
                  )}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
          <p className="ad-muted ad-review-checklist__note">
            {unmet > 0
              ? "A few wishes are not quite met. You can still deliver; the client will be kind about it."
              : "The score and stars are revealed when the client sees the dress."}
          </p>
        </Card>
        <Button
          size="lg"
          block
          icon="heart"
          onClick={(event) => once(event, { type: "deliver" })}
          disabledReason={check.ok ? undefined : check.reasons[0]}
          showReason
          data-testid="deliver"
        >
          {run.purpose.kind === "look" ? "Add the look to the collection" : "Deliver the dress"}
        </Button>
      </div>
    </div>
  );
}

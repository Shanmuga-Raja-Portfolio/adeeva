import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { CAREER } from "../../../content/career";
import {
  buyPlanIssue,
  cartLines,
  decorById,
  floorById,
  furnitureById,
  lightById,
  paintById,
  planCart,
  planShortfall,
  plannedSpend,
  type CartLine,
} from "../../../core";
import { FurniturePreview } from "../../art/FurniturePreview";
import { roomHex } from "../../art/roomHex";
import { DecorBin } from "./DecorBin";
import { StageFooter } from "./StageFooter";
import type { StageProps } from "./stageProps";
import "./shop.css";

function lineName(line: CartLine): string {
  switch (line.shelf) {
    case "furniture":
      return furnitureById(line.id).name;
    case "paints":
      return `${paintById(line.id).name} tin`;
    case "floors":
      return `${floorById(line.id).name} pack`;
    case "lights":
      return lightById(line.id).name;
    case "decor":
      return decorById(line.id).name;
  }
}

function lineSwatch(line: CartLine): string {
  switch (line.shelf) {
    case "furniture":
      return "#e9c7b8";
    case "paints":
      return roomHex(paintById(line.id).colour);
    case "floors":
      return roomHex(floorById(line.id).colours[0] ?? "ivory");
    case "lights":
      return roomHex(lightById(line.id).colour);
    case "decor":
      return "#f6d77a";
  }
}

export function ShopStage(props: StageProps) {
  const { state, run, dispatch } = props;
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const needed = cartLines(planCart(run));
  const missing = planShortfall(state, run);
  const missingLines = cartLines(missing);
  const issue = buyPlanIssue(state);
  const allThere = missingLines.length === 0;
  return (
    <div className="is-shop-stage">
      <div className="is-warehouse">
        <header className="is-warehouse__sign">
          <span>{CAREER.warehouseName}</span>
        </header>
        <ul className="is-warehouse__shelves" aria-label="Your plan list">
          {needed.map((line) => {
            const short =
              missingLines.find((entry) => entry.shelf === line.shelf && entry.id === line.id)?.count ?? 0;
            return (
              <li
                key={`${line.shelf}-${line.id}`}
                className={short === 0 ? "is-crate is-crate--ready" : "is-crate"}
              >
                {line.shelf === "furniture" ? (
                  <FurniturePreview furnitureId={line.id} soft="#e9c7b8" className="is-crate__art" />
                ) : (
                  <span
                    className="is-crate__swatch"
                    style={{ background: lineSwatch(line) }}
                    aria-hidden="true"
                  />
                )}
                <span className="is-crate__name">
                  {line.count} × {lineName(line)}
                </span>
                <span className="is-crate__tag">
                  {short === 0 ? (
                    <>
                      <Icon name="check" size={14} /> On your plan
                    </>
                  ) : line.count > short ? (
                    `${line.count - short} from your shelf, buy ${short}`
                  ) : (
                    `Buy ${short}`
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="is-warehouse__till">
          <p>
            <Icon name="coin" size={18} /> Plan total <strong>{plannedSpend(state, run)}</strong> of a{" "}
            {run.brief.budget} coin budget
          </p>
          {allThere ? (
            <p className="is-warehouse__done" role="status">
              <Icon name="check" size={18} /> You have everything on your plan.
            </p>
          ) : (
            <Button
              size="lg"
              icon="bag"
              data-testid="buy-plan"
              disabledReason={issue ?? undefined}
              showReason
              onClick={(event) => {
                if (once(event, { type: "buyPlan" })) toast("Everything is loaded into the van!");
              }}
            >
              Buy everything with a tick
            </Button>
          )}
        </div>
      </div>
      <DecorBin {...props} title="Decor Bin" />
      <StageFooter {...props} ready="All loaded up. Time to paint!" />
    </div>
  );
}

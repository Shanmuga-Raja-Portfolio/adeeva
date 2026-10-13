import { useState } from "react";
import { TRIMS, type TrimId } from "../../../content/trim";
import {
  MAX_TRIM_PURCHASE,
  trimPurchaseIssues,
  type Action,
  type DressRun,
  type GameState,
} from "../../../core";
import { TrimBadge } from "../../art/TrimArt";
import { Button } from "../../kit/Button";
import { useDispatchOnce } from "../../kit/useDispatchOnce";
import { QuantityStepper } from "./QuantityStepper";

export interface TrimShelfProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly dispatch: (action: Action) => boolean;
}

export function TrimShelf({ state, run, dispatch }: TrimShelfProps) {
  const once = useDispatchOnce(state, dispatch);
  const [counts, setCounts] = useState<Partial<Record<TrimId, number>>>({});
  const required = (trimId: TrimId) =>
    run.brief.requiredTrims.find((requirement) => requirement.trim === trimId)?.count ?? 0;
  const ordered = [...TRIMS].sort((a, b) => required(b.id) - required(a.id));
  return (
    <ul className="ad-trim-shelf">
      {ordered.map((trim) => {
        const owned = state.inventory.trims[trim.id];
        const needed = required(trim.id);
        const fallback = Math.max(1, needed - owned);
        const count = counts[trim.id] ?? fallback;
        const issues = trimPurchaseIssues(state, trim.id, count);
        return (
          <li
            key={trim.id}
            className={needed > 0 ? "ad-trim-card ad-trim-card--wanted" : "ad-trim-card"}
            data-trim={trim.id}
          >
            <TrimBadge trimId={trim.id} size={56} label={trim.name} />
            <div className="ad-trim-card__info">
              <strong>{trim.name}</strong>
              <span className="ad-trim-card__meta">
                {trim.price} coins each · {trim.tags.join(", ")}
              </span>
              <span className="ad-trim-card__owned">
                {owned} on hand{needed > 0 ? ` · brief asks for ${needed}` : ""}
              </span>
            </div>
            <div className="ad-trim-card__buy">
              <QuantityStepper
                label={`${trim.name} count`}
                value={count}
                step={1}
                min={1}
                max={MAX_TRIM_PURCHASE}
                unit="×"
                onChange={(value) => setCounts((current) => ({ ...current, [trim.id]: value }))}
              />
              <Button
                variant={needed > owned ? "primary" : "secondary"}
                onClick={(event) => once(event, { type: "buyTrim", trimId: trim.id, count })}
                disabledReason={issues[0]}
                showReason={state.calendar.shopOpen}
                aria-label={`Buy ${count} ${trim.name}`}
              >
                Buy · {trim.price * count}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

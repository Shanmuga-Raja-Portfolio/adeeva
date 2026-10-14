import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { DECOR } from "../../../content/decor";
import { buyDecorIssue, decorPrice, spareDecor } from "../../../core";
import { DecorArt } from "../../art/DecorArt";
import { roomHex } from "../../art/roomHex";
import type { StageProps } from "./stageProps";

export function DecorBin({ state, run, dispatch, title }: StageProps & { readonly title: string }) {
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const mustHave = new Set(run.brief.mustHaves.map((need) => need.itemId));
  return (
    <section className="is-bin" aria-labelledby="is-bin-title">
      <h3 id="is-bin-title" className="is-bin__title">
        {title} <span className="is-muted">optional, counts toward the budget</span>
      </h3>
      <ul className="is-bin__items">
        {DECOR.map((item) => {
          const issue = buyDecorIssue(state, item.id);
          return (
            <li
              key={item.id}
              className={mustHave.has(item.id) ? "is-bin__item is-bin__item--must" : "is-bin__item"}
            >
              <svg viewBox="-40 -40 80 80" className="is-bin__art" aria-hidden="true">
                <DecorArt decorId={item.id} soft={roomHex(run.softColour)} />
              </svg>
              <span className="is-bin__name">{item.name}</span>
              <span className="is-bin__owned">You have {spareDecor(state, run, item.id)}</span>
              {mustHave.has(item.id) ? <span className="is-tray__must">Must-have</span> : null}
              <Button
                size="sm"
                variant="secondary"
                disabledReason={issue ?? undefined}
                aria-label={`Buy ${item.name}`}
                data-testid={`buy-${item.id}`}
                onClick={(event) => {
                  if (once(event, { type: "buyDecor", decorId: item.id }))
                    toast(`${item.name} added to your decor box.`);
                }}
              >
                <Icon name="coin" size={13} /> {decorPrice(state, item.id)}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

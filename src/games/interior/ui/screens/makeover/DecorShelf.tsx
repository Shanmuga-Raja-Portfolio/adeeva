import { useToast } from "../../../../../studio/ToastContext";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useDispatchOnce } from "../../../../../ui/kit/useDispatchOnce";
import { DECOR, type DecorId } from "../../../content/decor";
import { buyDecorIssue, decorPrice, spareDecor } from "../../../core";
import { DecorArt } from "../../art/DecorArt";
import type { DragHandlers } from "../../usePointerDrag";
import { homeRoomContext } from "./homeRoomContext";
import type { StageProps } from "./stageProps";

interface DecorShelfProps extends StageProps {
  readonly soft: string;
  readonly stockHandlers: (decorId: DecorId) => DragHandlers;
  readonly onChoose: (pieceId: string) => void;
}

export function DecorShelf({ soft, stockHandlers, onChoose, ...props }: DecorShelfProps) {
  const { state, run, dispatch } = props;
  const toast = useToast();
  const once = useDispatchOnce(state, dispatch);
  const mustHave = new Set(run.brief.mustHaves.map((need) => need.itemId));
  const home = homeRoomContext(state, run);
  const story = new Set(home === null ? [] : home.story.pieces.map((piece) => piece.decorId));
  const rank = (id: DecorId) =>
    (spareDecor(state, run, id) > 0 ? 0 : run.decor.some((item) => item.decorId === id) ? 1 : 2) * 4 -
    Number(story.has(id)) * 2 -
    Number(mustHave.has(id));
  const items = [...DECOR].sort((a, b) => rank(a.id) - rank(b.id));
  return (
    <section className="is-shelf" aria-labelledby="is-shelf-title">
      <h3 id="is-shelf-title" className="is-shelf__title">
        Your decor box
        <span>Drag onto a glowing spot</span>
      </h3>
      <ul className="is-shelf__grid">
        {items.map((item) => {
          const spare = spareDecor(state, run, item.id);
          const placed = run.decor.find((entry) => entry.decorId === item.id);
          const issue = buyDecorIssue(state, item.id);
          const art = (
            <svg viewBox="-40 -40 80 80" aria-hidden="true">
              <DecorArt decorId={item.id} soft={soft} />
            </svg>
          );
          return (
            <li
              key={item.id}
              className={[
                "is-shelf__card",
                spare > 0 ? "is-shelf__card--ready" : "",
                placed !== undefined && spare <= 0 ? "is-shelf__card--placed" : "",
              ].join(" ")}
            >
              {spare > 0 ? (
                <button
                  type="button"
                  className="is-style__stock"
                  data-testid={`stock-${item.id}`}
                  aria-label={`Add ${item.name}. ${spare} left.`}
                  {...stockHandlers(item.id)}
                >
                  {art}
                  <span>{item.name}</span>
                  <span className="is-style__count">× {spare}</span>
                </button>
              ) : placed !== undefined ? (
                <button
                  type="button"
                  className="is-style__stock is-style__stock--placed"
                  data-testid={`in-room-${item.id}`}
                  aria-label={`${item.name} is in the room. Tap to choose it.`}
                  onClick={() => onChoose(placed.id)}
                >
                  {art}
                  <span>{item.name}</span>
                  <span className="is-style__in-room">
                    <Icon name="check" size={12} /> Placed
                  </span>
                </button>
              ) : (
                <div className="is-shelf__shop">
                  {art}
                  <span>{item.name}</span>
                </div>
              )}
              <div className="is-bin__item is-shelf__foot">
                {mustHave.has(item.id) ? <span className="is-tray__must">Must-have</span> : null}
                {story.has(item.id) ? (
                  <span className="is-tray__must is-tray__must--story">Story piece</span>
                ) : null}
                <Button
                  size="sm"
                  variant="secondary"
                  className="is-shelf__buy"
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
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

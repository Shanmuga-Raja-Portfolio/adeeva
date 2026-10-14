import { Button } from "../../../../../ui/kit/Button";
import { Card } from "../../../../../ui/kit/Card";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { SHOWCASE_FIRST_DAY } from "../../../content/season";
import {
  hangingPieces,
  isSeasonPick,
  ownFlipIssue,
  rackHooks,
  recipeById,
  SHELF_SIZE,
  seasonDay,
  shelfIssue,
  shelfPieces,
  stallDayIssue,
  suggestedShelf,
  unshelveIssue,
  type Action,
  type GameState,
  type RackPiece,
} from "../../../core";
import { pieceCloth } from "../../art/findCloth";
import { LeafMeter } from "../../art/LeafMeter";
import { ProductPreview } from "../../art/ProductPreview";

export interface RackPanelProps {
  readonly state: GameState;
  readonly onStartOwn: (event: ClickLike) => void;
  readonly onContinue: () => void;
  readonly onShelf: (event: ClickLike, action: Action) => void;
}

function PieceArt({ piece }: { readonly piece: RackPiece }) {
  return (
    <ProductPreview
      design={piece.design}
      cloth={pieceCloth(piece.id, piece.cloth)}
      finishes={piece.finishes}
      title={recipeById(piece.recipeId).name}
      className="tf-rack__art"
    />
  );
}

function ShowShelf({ state, onShelf }: Pick<RackPanelProps, "state" | "onShelf">) {
  const boutique = state.boutique;
  if (boutique === null || boutique.season.showcase !== null) return null;
  const shelf = shelfPieces(state);
  const day = seasonDay(state) ?? 0;
  const suggested = suggestedShelf(state);
  return (
    <section className="tf-shelf" aria-label="Show shelf" data-testid="show-shelf">
      <h4 className="tf-stock__heading">
        Show shelf · {shelf.length}/{SHELF_SIZE}
      </h4>
      <ul className="tf-shelf__slots">
        {Array.from({ length: SHELF_SIZE }, (_, index) => {
          const piece = shelf[index];
          if (piece === undefined)
            return (
              <li
                key={index}
                className="tf-shelf__slot tf-shelf__slot--empty"
                aria-label="Empty shelf spot"
              />
            );
          const issue = unshelveIssue(state, piece.id);
          return (
            <li key={piece.id} className="tf-shelf__slot">
              <PieceArt piece={piece} />
              <span className="tf-rack__name">{recipeById(piece.recipeId).name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => onShelf(event, { type: "unshelvePiece", pieceId: piece.id })}
                disabledReason={issue ?? undefined}
              >
                Back to rack
              </Button>
            </li>
          );
        })}
      </ul>
      {day >= SHOWCASE_FIRST_DAY && suggested.length > 0 ? (
        <div className="tf-shelf__suggest" role="status">
          <span>Your show shelf has room. Add these?</span>
          <Button
            size="sm"
            onClick={(event) => onShelf(event, { type: "fillShelf" })}
            data-testid="fill-shelf"
          >
            Add {suggested.map((piece) => recipeById(piece.recipeId).name).join(", ")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export function RackPanel({ state, onStartOwn, onContinue, onShelf }: RackPanelProps) {
  const size = rackHooks(state);
  const hanging = hangingPieces(state);
  const boutique = state.boutique !== null;
  const run = state.activeRun;
  const ownOnBench = run !== null && run.stage !== "done" && run.purpose.kind === "own";
  const issue = ownFlipIssue(state);
  return (
    <Card
      title={boutique ? "Seasonal rack" : "Your stall rack"}
      eyebrow={`${hanging.length} of ${size} hooks used`}
      className="tf-hub-card tf-rack"
      data-testid="rack-panel"
    >
      <ul className={boutique ? "tf-rack__hooks tf-rack__hooks--wide" : "tf-rack__hooks"}>
        {Array.from({ length: Math.max(size, hanging.length) }, (_, index) => {
          const piece = hanging[index];
          if (piece === undefined)
            return (
              <li key={index} className="tf-rack__hook tf-rack__hook--empty">
                <span className="tf-rack__empty" aria-hidden="true" />
              </li>
            );
          const shelfReason = boutique ? shelfIssue(state, piece.id) : null;
          return (
            <li key={piece.id} className="tf-rack__hook" data-piece={piece.id}>
              <PieceArt piece={piece} />
              <span className="tf-rack__name">{recipeById(piece.recipeId).name}</span>
              <LeafMeter leaves={piece.leaves} size={14} />
              {boutique && isSeasonPick(state, piece) ? <TagPill tone="hot">Season pick</TagPill> : null}
              {boutique && piece.showcaseSeason === state.boutique?.season.number ? (
                <TagPill tone="gold">Showcase piece</TagPill>
              ) : null}
              {boutique && shelfReason === null ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(event) => onShelf(event, { type: "shelvePiece", pieceId: piece.id })}
                  data-testid={`shelve-${piece.id}`}
                >
                  To show shelf
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
      <ShowShelf state={state} onShelf={onShelf} />
      {ownOnBench ? (
        <Button
          variant="secondary"
          onClick={onContinue}
          disabledReason={stallDayIssue(state.calendar.day) ?? undefined}
        >
          Continue your own piece
        </Button>
      ) : (
        <Button
          variant="secondary"
          icon="sparkle"
          onClick={onStartOwn}
          disabledReason={issue ?? undefined}
          data-testid="start-own"
        >
          {boutique ? "Make a piece for the rack" : "Make a piece for Stall Day"}
        </Button>
      )}
    </Card>
  );
}

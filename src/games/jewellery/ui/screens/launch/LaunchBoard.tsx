import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { LaunchThemeDef } from "../../../content/launchTheme";
import {
  launchMinimum,
  productById,
  slotOnBench,
  spotByNumber,
  type CollectionState,
  type GameState,
} from "../../../core";
import { PhotoArt } from "../../art/PhotoArt";
import { PiecePreview } from "../../art/PiecePreview";
import { ThemeBadge } from "../loft/ThemeBadge";

export interface LaunchBoardProps {
  readonly state: GameState;
  readonly collection: CollectionState;
  readonly theme: LaunchThemeDef;
  readonly onNext: () => void;
}

export function LaunchBoard({ state, collection, theme, onNext }: LaunchBoardProps) {
  const brief = collection.brief;
  const spot = spotByNumber(state.launch?.spot ?? 1);
  const unfinished =
    brief === null
      ? []
      : brief.products.flatMap((productId, slot) =>
          collection.pieces.some((piece) => piece.slot === slot) ? [] : [{ productId, slot }],
        );
  const ready = collection.pieces.length >= launchMinimum(state.profile.difficulty);
  return (
    <section className="jb-launch-board" data-testid="launch-board" aria-labelledby="jb-launch-board-title">
      <header className="jb-launch-board__head">
        <div>
          <span className="ad-eyebrow">Launch Board · {spot.name}</span>
          <h2 id="jb-launch-board-title">{theme.name}</h2>
          <ThemeBadge theme={theme} />
        </div>
      </header>
      <div className="jb-launch-board__pieces">
        {collection.pieces.map((piece) => {
          const page = collection.lookbook.pages.find((entry) => entry.pieceId === piece.id);
          const name = productById(piece.look.productId).name;
          return (
            <article key={piece.id} className="jb-launch-piece" data-testid={`launch-piece-${piece.slot}`}>
              <PiecePreview source={piece.look} title={name} />
              <div>
                <strong>{name}</strong>
                <span className="jb-muted">
                  Quality {piece.quality}
                  {piece.carriesMotif ? " · carries the motif" : ""}
                </span>
              </div>
              {page === undefined ? (
                <p className="jb-launch-piece__missing">
                  <Icon name="close" size={14} /> Missing page: a plain lantern slide instead.
                </p>
              ) : (
                <svg
                  viewBox="0 0 240 240"
                  className="jb-launch-piece__page"
                  role="img"
                  aria-label={`${name} Lookbook page`}
                >
                  <PhotoArt
                    backdrop={page.backdrop}
                    props={page.props}
                    piece={piece.look}
                    light={page.light ?? 0}
                  />
                </svg>
              )}
            </article>
          );
        })}
        {unfinished.map(({ productId, slot }) => (
          <article key={productId} className="jb-launch-piece jb-launch-piece--waiting">
            <span className="jb-line-tray__empty">
              <Icon name="sparkle" size={20} />
            </span>
            <div>
              <strong>{productById(productId).name}</strong>
              <span className="jb-muted">
                {slotOnBench(state, slot) ? "Joins next season's line" : "Not in this Launch"}
              </span>
            </div>
          </article>
        ))}
      </div>
      <footer className="jb-launch-board__foot">
        <p className="jb-hint">Ready or not, the lanterns are lit for you.</p>
        <Button
          size="lg"
          icon="sparkle"
          onClick={onNext}
          disabledReason={
            ready ? undefined : `Finish at least ${launchMinimum(state.profile.difficulty)} pieces first.`
          }
          showReason
          data-testid="to-planner"
        >
          Plan the reveal
        </Button>
      </footer>
    </section>
  );
}

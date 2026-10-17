import { Card } from "../../../../../ui/kit/Card";
import { productById, type CollectionState, type GameState } from "../../../core";
import { PhotoArt } from "../../art/PhotoArt";
import { LoftHeader } from "../loft/LoftHeader";

export interface LookbookAlbumProps {
  readonly state: GameState;
  readonly collection: CollectionState;
  readonly onExit: () => void;
}

export function LookbookAlbum({ state, collection, onExit }: LookbookAlbumProps) {
  return (
    <main className="jb-lookbook ad-screen" data-testid="lookbook-album">
      <LoftHeader state={state} eyebrow="The Lantern Loft" title="Lookbook album" onExit={onExit} />
      <div className="jb-album">
        {collection.pieces.map((piece, index) => {
          const page = collection.lookbook.pages.find((entry) => entry.pieceId === piece.id);
          const name = productById(piece.look.productId).name;
          return (
            <Card key={piece.id} className="jb-album__page" title={`Page ${index + 1} · ${name}`}>
              {page === undefined ? (
                <p className="jb-muted">A missing page. This piece will shine on a plain slide.</p>
              ) : (
                <>
                  <svg
                    viewBox="0 0 240 240"
                    role="img"
                    aria-label={`${name} photo`}
                    className="jb-album__photo"
                  >
                    <PhotoArt
                      backdrop={page.backdrop}
                      props={page.props}
                      piece={piece.look}
                      light={page.light ?? 0}
                      lampAngle={page.lampAngle}
                    />
                  </svg>
                  <p className="jb-muted">
                    {page.light === null ? "Styled, not snapped" : `${Math.round(page.light * 100)}% light`}
                    {page.assisted ? " · Osei's lamp" : ""}
                  </p>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </main>
  );
}

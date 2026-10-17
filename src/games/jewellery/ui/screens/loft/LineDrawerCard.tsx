import { Card } from "../../../../../ui/kit/Card";
import { DRAWER_SIZE, drawerGentlePrice, productById, type CollectionState } from "../../../core";
import { PiecePreview } from "../../art/PiecePreview";

export function LineDrawerCard({ collection }: { readonly collection: CollectionState }) {
  if (collection.drawer.length === 0) return null;
  return (
    <Card
      title="Line Drawer"
      eyebrow={`${collection.drawer.length} of ${DRAWER_SIZE} waiting`}
      className="jb-hub-card"
      data-testid="line-drawer"
    >
      <p className="jb-muted">
        Pieces from earlier lines wait here. Put them on a Market Day tray or the Little shelf.
      </p>
      <ul className="jb-drawer-row">
        {collection.drawer.map((piece) => (
          <li key={piece.id}>
            <PiecePreview source={piece.look} title={productById(piece.look.productId).name} />
            <span>Gentle {drawerGentlePrice(piece)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

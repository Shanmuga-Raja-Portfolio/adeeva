import { polishScore, productById, type CollectionState, type PieceRun } from "../../../core";

export interface ShineBarProps {
  readonly collection: CollectionState;
  readonly run: PieceRun;
}

export function ShineBar({ collection, run }: ShineBarProps) {
  const rows = [
    ...collection.pieces.map((piece) => ({
      id: piece.id,
      name: productById(piece.look.productId).name,
      value: piece.polish,
      now: false,
    })),
    { id: run.id, name: "This piece", value: polishScore(run), now: true },
  ];
  return (
    <section className="jb-shine-bar" aria-label="Even shine across your line" data-testid="shine-bar">
      <strong>Even shine</strong>
      <ul>
        {rows.map((row) => (
          <li
            key={row.id}
            className={row.now ? "jb-shine-bar__row jb-shine-bar__row--now" : "jb-shine-bar__row"}
          >
            <span className="jb-shine-bar__name">{row.name}</span>
            <span className="jb-shine-bar__track">
              <span className="jb-shine-bar__fill" style={{ width: `${Math.round(row.value * 100)}%` }} />
            </span>
            <span className="jb-shine-bar__value">{Math.round(row.value * 100)}%</span>
          </li>
        ))}
      </ul>
      <p className="jb-hint">A line shines brightest when every piece shines alike.</p>
    </section>
  );
}

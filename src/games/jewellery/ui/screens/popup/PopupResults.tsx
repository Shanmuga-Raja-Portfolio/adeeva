import { useEffect } from "react";
import { focusHeading } from "../../../../../studio/focusHeading";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { useArmedAfter } from "../../../../../ui/kit/useArmedAfter";
import {
  clientById,
  priceTagById,
  productById,
  type PendingCopy,
  type PopupBoardRow,
  type PopupResult,
} from "../../../core";
import { PiecePreview } from "../../art/PiecePreview";

export interface PopupResultsProps {
  readonly popup: PopupResult;
  readonly rows: readonly PopupBoardRow[];
  readonly pending: readonly PendingCopy[];
  readonly onExit: () => void;
}

export function PopupResults({ popup, rows, pending, onExit }: PopupResultsProps) {
  const armed = useArmedAfter(600);
  const sold = popup.entries.filter((entry) => entry.sold).length;
  useEffect(() => {
    focusHeading("#jb-popup-results-title");
  }, []);
  return (
    <section
      className="jb-popup-results"
      data-testid="popup-results"
      aria-labelledby="jb-popup-results-title"
    >
      <header className="jb-launch-results__hero">
        <div>
          <span className="ad-eyebrow">Pop-up Window</span>
          <h1 id="jb-popup-results-title">
            {sold} of {popup.entries.length} pieces found homes!
          </h1>
          <div className="jb-launch-results__totals" data-testid="popup-totals">
            <span>
              <Icon name="coin" size={18} /> +{popup.coins}
            </span>
            <span>
              <Icon name="megaphone" size={18} /> +{popup.buzz} buzz
            </span>
          </div>
        </div>
      </header>
      <ul className="jb-popup-results__entries">
        {popup.entries.map((entry) => {
          const row = rows.find((candidate) => candidate.piece.id === entry.pieceId);
          return (
            <li
              key={entry.pieceId}
              className={entry.sold ? "jb-popup-entry jb-popup-entry--sold" : "jb-popup-entry"}
            >
              {row !== undefined ? <PiecePreview source={row.piece.look} title={null} /> : null}
              <strong>
                {row === undefined ? "A line piece" : productById(row.piece.look.productId).name}
              </strong>
              <span>
                {priceTagById(entry.tag).name} tag · {entry.hearts} ♥
              </span>
              <span className="jb-popup-entry__state">
                {entry.cameBack
                  ? `A visitor came back for it! +${entry.price}`
                  : entry.sold
                    ? `Sold for ${entry.price}`
                    : "Waits in the Line Drawer"}
              </span>
            </li>
          );
        })}
      </ul>
      {popup.shelf.length > 0 ? (
        <p className="jb-muted">
          Little shelf: {popup.shelf.filter((sale) => sale.sold).length} sold for{" "}
          {popup.shelf.reduce((sum, sale) => sum + sale.coins, 0)} coins.
        </p>
      ) : null}
      {popup.lines.length > 0 ? (
        <ul className="jb-popup-results__lines">
          {popup.lines.map((line) => (
            <li key={line.label}>
              <Icon name="sparkle" size={14} /> {line.label} +{line.amount}
            </li>
          ))}
        </ul>
      ) : null}
      {pending.length > 0 ? (
        <aside className="jb-launch-notes" data-testid="copy-requests">
          <h2>Copy requests</h2>
          <ul>
            {pending.map((copy, index) => (
              <li key={`${copy.visitorId}-${index}`}>
                <Icon name="heart" size={14} /> {clientById(copy.visitorId)?.name ?? "A visitor"} would love a{" "}
                {productById(copy.productId).name} just like yours, for {copy.fee} coins. It arrives as an
                order tag tomorrow.
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
      <footer className="jb-launch-board__foot">
        <Button size="lg" onClick={onExit} disabled={!armed} data-testid="popup-exit">
          Back to the loft
        </Button>
      </footer>
    </section>
  );
}

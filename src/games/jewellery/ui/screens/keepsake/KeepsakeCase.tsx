import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { StarRating } from "../../../../../ui/kit/StarRating";
import {
  awardById,
  clientById,
  KEEPSAKE_CASE_SIZE,
  launchThemeById,
  productById,
  themeById,
  type GameState,
  type KeepsakeEntry,
} from "../../../core";
import { PiecePreview } from "../../art/PiecePreview";
import "./keepsake.css";

interface KeepsakeCaseProps {
  readonly state: GameState;
  readonly onExit: () => void;
}

function sourceName(entry: KeepsakeEntry): string {
  if (entry.source.kind === "order") return `For ${clientById(entry.source.clientId)?.name ?? "a neighbour"}`;
  if (entry.source.kind === "collection")
    return `${launchThemeById(entry.source.themeId).name} · ${awardById(entry.source.award).name}`;
  return `${themeById(entry.source.themeId).name} · shopper score ${entry.source.score}`;
}

export function KeepsakeCase({ state, onExit }: KeepsakeCaseProps) {
  const [open, setOpen] = useState<KeepsakeEntry | null>(null);
  const entries = [...state.keepsakes].reverse();
  return (
    <main className="jb-keepsake ad-screen" data-testid="keepsake-case">
      <header className="jb-keepsake__head">
        <Button variant="ghost" icon="back" onClick={onExit}>
          Back to the arcade
        </Button>
        <div>
          <span className="ad-eyebrow">
            {state.keepsakes.length} of {KEEPSAKE_CASE_SIZE} spaces
          </span>
          <h1>Keepsake Case</h1>
        </div>
      </header>
      <section className="jb-keepsake__case">
        <div className="jb-keepsake__glass" aria-hidden="true" />
        {entries.length === 0 ? (
          <p className="jb-keepsake__empty">
            Your case is waiting for its first treasure. Deliver an order to fill it.
          </p>
        ) : (
          <ul className="jb-keepsake__grid">
            {entries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="jb-keepsake__card"
                  onClick={() => setOpen(entry)}
                  aria-label={`${productById(entry.look.productId).name}, ${sourceName(entry)}, day ${entry.day}`}
                >
                  <PiecePreview source={entry.look} title={null} />
                  <span className="jb-keepsake__label">{sourceName(entry)}</span>
                  <StarRating stars={entry.stars} size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Dialog
        open={open !== null}
        title={open === null ? "" : productById(open.look.productId).name}
        onClose={() => setOpen(null)}
        className="jb-keepsake__dialog"
      >
        {open !== null ? (
          <div className="jb-keepsake__detail">
            <PiecePreview
              source={open.look}
              title={productById(open.look.productId).name}
              twinkle
              className="jb-keepsake__big"
            />
            <div>
              <span className="ad-eyebrow">
                Day {open.day} · {sourceName(open)}
              </span>
              <StarRating stars={open.stars} size={22} />
              <blockquote className="jb-keepsake__line">“{open.line}”</blockquote>
            </div>
          </div>
        ) : null}
      </Dialog>
    </main>
  );
}

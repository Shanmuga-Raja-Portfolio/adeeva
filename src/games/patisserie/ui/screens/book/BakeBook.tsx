import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { BAKE_BOOK_SIZE, type BakeBookEntry, type GameState } from "../../../core";
import { BakeBookCard } from "./BakeBookCard";
import "./book.css";

export interface BakeBookProps {
  readonly state: GameState;
  readonly onExit: () => void;
}

export function BakeBook({ state, onExit }: BakeBookProps) {
  const [open, setOpen] = useState<BakeBookEntry | null>(null);
  const entries = [...state.bakeBook].reverse();
  return (
    <main className="pa-book ad-screen" data-testid="bake-book">
      <header className="pa-book__header">
        <Button variant="ghost" icon="back" onClick={onExit}>
          Back to the shop
        </Button>
        <div>
          <span className="ad-eyebrow">Your newest {BAKE_BOOK_SIZE} bakes</span>
          <h1>The Bake Book</h1>
        </div>
      </header>
      {entries.length === 0 ? (
        <p className="pa-book__empty pa-doily">
          Every bake you deliver gets a page here, with a thank-you from its owner.
        </p>
      ) : (
        <ul className="pa-book__grid">
          {entries.map((entry) => (
            <li key={entry.runId}>
              <button
                type="button"
                className="pa-book__open"
                onClick={() => setOpen(entry)}
                aria-label={`Open the page for day ${entry.day}`}
              >
                <BakeBookCard entry={entry} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={open !== null} title="A page from the Bake Book" onClose={() => setOpen(null)}>
        {open !== null ? <BakeBookCard entry={open} large /> : null}
      </Dialog>
    </main>
  );
}

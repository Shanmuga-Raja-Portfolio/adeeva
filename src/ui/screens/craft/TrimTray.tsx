import type { PointerEvent } from "react";
import { TRIM_IDS, type TrimId } from "../../../content/trim";
import { availableTrims, trimById, type DressRun, type GameState } from "../../../core";
import { TrimBadge } from "../../art/TrimArt";

export interface TrimTrayProps {
  readonly state: GameState;
  readonly run: DressRun;
  readonly liftedId: TrimId | null;
  readonly onPointerDown: (event: PointerEvent<HTMLButtonElement>, trimId: TrimId) => void;
  readonly onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  readonly onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
  readonly onPointerCancel: () => void;
  readonly onKeyboardPick: (trimId: TrimId) => void;
}

export function TrimTray({
  state,
  run,
  liftedId,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyboardPick,
}: TrimTrayProps) {
  const owned = TRIM_IDS.filter((trimId) => state.inventory.trims[trimId] > 0);
  const wanted = (trimId: TrimId) =>
    run.brief.requiredTrims.find((requirement) => requirement.trim === trimId)?.count ?? 0;
  if (owned.length === 0)
    return (
      <p className="ad-muted ad-trim-tray__empty">
        Your trim box is empty. Trims come from the fabric shop, so pick some up on your next dress.
      </p>
    );
  return (
    <ul className="ad-trim-tray">
      {owned.map((trimId) => {
        const left = availableTrims(state, trimId);
        const placed = run.decorations.filter((decoration) => decoration.trimId === trimId).length;
        const need = wanted(trimId);
        return (
          <li key={trimId}>
            <button
              type="button"
              className={liftedId === trimId ? "ad-trim-chip ad-trim-chip--lifted" : "ad-trim-chip"}
              disabled={left <= 0}
              data-trim={trimId}
              onPointerDown={(event) => onPointerDown(event, trimId)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              onClick={(event) => {
                if (event.detail === 0) onKeyboardPick(trimId);
              }}
            >
              <TrimBadge trimId={trimId} size={48} />
              <span className="ad-trim-chip__name">{trimById(trimId).name}</span>
              <span className="ad-trim-chip__count">{left} left</span>
              {need > 0 ? (
                <span
                  className={
                    placed >= need ? "ad-trim-chip__need ad-trim-chip__need--met" : "ad-trim-chip__need"
                  }
                >
                  {Math.min(placed, need)}/{need} for the brief
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

import type { PointerEvent } from "react";
import type { FabricDef } from "../../../content/fabric";
import type { DressRun, RequiredPiece } from "../../../core";
import { GrainBadge } from "./GrainBadge";
import { PieceThumb } from "./PieceThumb";

export interface PieceTrayProps {
  readonly run: DressRun;
  readonly entries: readonly RequiredPiece[];
  readonly fabric: FabricDef | undefined;
  readonly selectedId: string | null;
  readonly draggingId: string | null;
  readonly onPointerDown: (event: PointerEvent<HTMLButtonElement>, pieceId: string) => void;
  readonly onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  readonly onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
  readonly onPointerCancel: () => void;
  readonly onKeyboardPick: (pieceId: string) => void;
}

export function PieceTray({
  run,
  entries,
  fabric,
  selectedId,
  draggingId,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyboardPick,
}: PieceTrayProps) {
  const waiting = entries.filter((entry) => run.placements[entry.piece.id] === undefined).length;
  return (
    <div className="ad-piece-tray">
      <header className="ad-piece-tray__header">
        <strong>Pattern pieces</strong>
        <span className="ad-muted">
          {waiting > 0 ? `${waiting} waiting · tap to lay one down, or drag it` : "All on the fabric"}
        </span>
      </header>
      <ul className="ad-piece-tray__list">
        {entries.map((entry) => {
          const placement = run.placements[entry.piece.id];
          const classes = [
            "ad-tray-piece",
            placement !== undefined ? "ad-tray-piece--placed" : "",
            selectedId === entry.piece.id ? "ad-tray-piece--selected" : "",
            draggingId === entry.piece.id ? "ad-tray-piece--lifted" : "",
          ].join(" ");
          return (
            <li key={entry.piece.id}>
              <button
                type="button"
                className={classes}
                data-tray-piece={entry.piece.id}
                onPointerDown={(event) => onPointerDown(event, entry.piece.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                onClick={(event) => {
                  if (event.detail === 0) onKeyboardPick(entry.piece.id);
                }}
              >
                <PieceThumb piece={entry.piece} fabric={fabric} rotation={placement?.rotation ?? 0} />
                <span className="ad-tray-piece__text">
                  <span className="ad-tray-piece__name">{entry.piece.name}</span>
                  {placement !== undefined ? (
                    <GrainBadge piece={entry.piece} rotation={placement.rotation} compact />
                  ) : (
                    <span className="ad-tray-piece__hint">
                      {entry.piece.grain === "bias-friendly" ? "Bias friendly" : "Straight grain"}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import type { Action, PiecePlacement, RequiredPiece } from "../../../core";
import { Button } from "../../kit/Button";
import { GRAIN_EXPLANATIONS, GrainBadge, grainKind } from "./GrainBadge";
import { rotateInPlace, turned } from "./pieceGeometry";

export interface PieceInspectorProps {
  readonly entry: RequiredPiece | undefined;
  readonly placement: PiecePlacement | undefined;
  readonly dispatch: (action: Action) => void;
  readonly onClear: () => void;
}

export function PieceInspector({ entry, placement, dispatch, onClear }: PieceInspectorProps) {
  if (entry === undefined || placement === undefined) {
    return (
      <div className="ad-piece-inspector ad-piece-inspector--empty">
        <strong>Grain matters</strong>
        <p>
          Every piece has a grain arrow. Line it up with the bolt for <em>straight grain</em> and a piece that
          hangs true. Turn it 45° to cut <em>on the bias</em>: it stretches and drapes, which skirts marked
          bias friendly love. Tap a piece on the fabric to inspect it.
        </p>
      </div>
    );
  }
  const rotate = (steps: number) => {
    const next = turned(placement.rotation, steps);
    const spot = rotateInPlace(entry.piece.shape, placement, next);
    dispatch({ type: "placePiece", pieceId: entry.piece.id, x: spot.x, y: spot.y, rotation: next });
  };
  return (
    <div className="ad-piece-inspector" aria-live="polite">
      <header className="ad-piece-inspector__header">
        <strong>{entry.piece.name}</strong>
        <GrainBadge piece={entry.piece} rotation={placement.rotation} />
      </header>
      <p className="ad-piece-inspector__why">
        {GRAIN_EXPLANATIONS[grainKind(entry.piece, placement.rotation)]}
      </p>
      <div className="ad-piece-inspector__actions">
        <Button
          variant="secondary"
          onClick={() => rotate(-1)}
          aria-label={`Turn ${entry.piece.name} left 45 degrees`}
        >
          ↺ 45°
        </Button>
        <Button
          variant="secondary"
          onClick={() => rotate(1)}
          aria-label={`Turn ${entry.piece.name} right 45 degrees`}
        >
          ↻ 45°
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            dispatch({ type: "removePiece", pieceId: entry.piece.id });
            onClear();
          }}
        >
          Back to tray
        </Button>
      </div>
      <small className="ad-muted">Tip: double-tap a piece to turn it. Turned {placement.rotation}°.</small>
    </div>
  );
}

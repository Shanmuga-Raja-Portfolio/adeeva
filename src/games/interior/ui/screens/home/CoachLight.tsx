import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { COACH_CORNER, COACH_LAMP, COACH_PIECES, litSpots, pieceShape } from "../../../core";
import { BlueprintGrid, PLAN_CELL } from "../../art/BlueprintGrid";
import { FurnitureSymbol, symbolTransform } from "../../art/FurnitureSymbol";

interface CoachLightProps {
  readonly onDone: (col: number, row: number) => boolean;
}

export function CoachLight({ onDone }: CoachLightProps) {
  const [cell, setCell] = useState<readonly [number, number] | null>(null);
  const lights = cell === null ? [] : [{ lightId: COACH_LAMP, col: cell[0], row: cell[1] }];
  const spots = litSpots(COACH_CORNER, COACH_PIECES, lights);
  return (
    <div className="is-coach-light">
      <BlueprintGrid
        room={COACH_CORNER}
        title="A sample corner with two bean bags"
        className="is-coach-light__grid"
      >
        {cell === null ? null : (
          <circle
            cx={(cell[0] + 0.5) * PLAN_CELL}
            cy={(cell[1] + 0.5) * PLAN_CELL}
            r={PLAN_CELL * 2.2}
            fill="#ffe08a"
            opacity={0.35}
            pointerEvents="none"
          />
        )}
        {COACH_PIECES.map((piece) => {
          const shape = pieceShape(piece.furnitureId, piece.rotation);
          return (
            <g
              key={piece.id}
              transform={symbolTransform(
                piece.furnitureId,
                PLAN_CELL,
                (piece.col + shape.width / 2) * PLAN_CELL,
                (piece.row + shape.depth / 2) * PLAN_CELL,
                piece.rotation,
              )}
              pointerEvents="none"
            >
              <FurnitureSymbol
                furnitureId={piece.furnitureId}
                cell={PLAN_CELL}
                fill="rgba(208,88,126,0.85)"
              />
            </g>
          );
        })}
        {Array.from({ length: COACH_CORNER.cols * COACH_CORNER.rows }, (_, index) => {
          const col = index % COACH_CORNER.cols;
          const row = Math.floor(index / COACH_CORNER.cols);
          const here = cell !== null && cell[0] === col && cell[1] === row;
          return (
            <rect
              key={index}
              x={col * PLAN_CELL + 4}
              y={row * PLAN_CELL + 4}
              width={PLAN_CELL - 8}
              height={PLAN_CELL - 8}
              rx={8}
              fill={here ? "rgba(246,215,122,0.75)" : "rgba(255,255,255,0.04)"}
              stroke="#f6d77a"
              strokeOpacity={here ? 1 : 0.35}
              strokeWidth={2}
              role="button"
              tabIndex={0}
              aria-label={`Hang the lantern on square ${col + 1}, ${row + 1}`}
              className="is-coach-light__cell"
              onClick={() => setCell([col, row])}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setCell([col, row]);
                }
              }}
              data-testid={`coach-cell-${col}-${row}`}
            />
          );
        })}
      </BlueprintGrid>
      <p className="is-floor__hint" role="status" aria-live="polite">
        {cell === null
          ? "Tap a square to hang the lantern."
          : `${spots.lit} of ${spots.total} bean bags glow.`}
      </p>
      <Button
        disabled={cell === null}
        onClick={() => cell !== null && onDone(cell[0], cell[1])}
        data-testid="coach-light-done"
      >
        Show the crew
      </Button>
    </div>
  );
}

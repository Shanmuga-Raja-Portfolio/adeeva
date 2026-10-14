import type { PointerEvent } from "react";
import type { PartDef } from "../../../../content/product";
import type { QuarterTurn } from "../../../../core";
import { footprint, nextTurn } from "./layoutGeometry";

interface PartTrayProps {
  readonly parts: readonly PartDef[];
  readonly turns: Readonly<Record<string, QuarterTurn>>;
  readonly draggingId: string | null;
  readonly onTurn: (partId: string, turn: QuarterTurn) => void;
  readonly onStartDrag: (event: PointerEvent, part: PartDef) => void;
  readonly onPlace: (partId: string) => void;
}

export function PartTray({ parts, turns, draggingId, onTurn, onStartDrag, onPlace }: PartTrayProps) {
  return (
    <section className="ww-tray" aria-labelledby="ww-tray-title">
      <h2 id="ww-tray-title" className="ww-tray__title">
        Parts tray
      </h2>
      {parts.length === 0 ? (
        <p className="ww-muted">The tray is empty. Every part is on a board!</p>
      ) : (
        <ul className="ww-tray__list">
          {parts.map((part) => {
            const turn = turns[part.id] ?? 0;
            const size = footprint(part, turn);
            const along = turn % 180 === 0;
            const box = Math.max(size.width, size.height) + 4;
            return (
              <li
                key={part.id}
                className={draggingId === part.id ? "ww-tray__item ww-tray__item--dragging" : "ww-tray__item"}
              >
                <button
                  type="button"
                  className="ww-tray__part"
                  onPointerDown={(event) => onStartDrag(event, part)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    onPlace(part.id);
                  }}
                  aria-label={`Drag ${part.name} onto a board, or press Enter to find it a spot`}
                  data-testid={`tray-${part.id}`}
                >
                  <svg viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`} aria-hidden="true">
                    <rect
                      x={-size.width / 2}
                      y={-size.height / 2}
                      width={size.width}
                      height={size.height}
                      rx={0.8}
                      className="ww-tray__shape"
                    />
                    <path
                      d={
                        along
                          ? `M${-size.width / 3} 0 H${size.width / 3}`
                          : `M0 ${-size.height / 3} V${size.height / 3}`
                      }
                      className="ww-tray__arrow"
                    />
                  </svg>
                  <span className="ww-tray__name">{part.name}</span>
                  <span className="ww-tray__size">
                    {part.width} × {part.height}
                  </span>
                </button>
                <button
                  type="button"
                  className="ww-tray__turn"
                  onClick={() => onTurn(part.id, nextTurn(turn))}
                  aria-label={`Turn ${part.name}`}
                >
                  ↻
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

import { forwardRef, type ReactNode } from "react";
import type { RoomTemplate } from "../../content/roomTemplate";

export const PLAN_CELL = 60;
const PLAN_PAD = 26;

interface BlueprintGridProps {
  readonly room: RoomTemplate;
  readonly title: string;
  readonly className?: string | undefined;
  readonly children?: ReactNode;
}

const DISPLAY_WIDTH = 600;

function planSize(room: RoomTemplate): { readonly width: number; readonly height: number } {
  return { width: room.cols * PLAN_CELL + PLAN_PAD * 2, height: room.rows * PLAN_CELL + PLAN_PAD * 2 };
}

function displayScale(room: RoomTemplate): number {
  return Math.min(1.45, Math.max(0.95, DISPLAY_WIDTH / planSize(room).width));
}

export const BlueprintGrid = forwardRef<SVGSVGElement, BlueprintGridProps>(function BlueprintGrid(
  { room, title, className, children },
  ref,
) {
  const size = planSize(room);
  const width = room.cols * PLAN_CELL;
  const height = room.rows * PLAN_CELL;
  const doorX = room.doorCol * PLAN_CELL;
  return (
    <svg
      ref={ref}
      className={className}
      viewBox={`${-PLAN_PAD} ${-PLAN_PAD} ${size.width} ${size.height}`}
      width={size.width * displayScale(room)}
      height={size.height * displayScale(room)}
      role="img"
      aria-label={title}
    >
      <rect x={-PLAN_PAD} y={-PLAN_PAD} width={size.width} height={size.height} rx={18} fill="#3c6aa8" />
      <g stroke="#ffffff" strokeOpacity={0.16} strokeWidth={1}>
        {Array.from({ length: room.cols * 4 + 1 }, (_, index) => (
          <path key={`v${index}`} d={`M${(index * PLAN_CELL) / 4} 0 L${(index * PLAN_CELL) / 4} ${height}`} />
        ))}
        {Array.from({ length: room.rows * 4 + 1 }, (_, index) => (
          <path key={`h${index}`} d={`M0 ${(index * PLAN_CELL) / 4} L${width} ${(index * PLAN_CELL) / 4}`} />
        ))}
      </g>
      <g stroke="#ffffff" strokeOpacity={0.5} strokeWidth={1.5}>
        {Array.from({ length: room.cols - 1 }, (_, index) => (
          <path
            key={`cv${index}`}
            d={`M${(index + 1) * PLAN_CELL} 0 L${(index + 1) * PLAN_CELL} ${height}`}
          />
        ))}
        {Array.from({ length: room.rows - 1 }, (_, index) => (
          <path key={`ch${index}`} d={`M0 ${(index + 1) * PLAN_CELL} L${width} ${(index + 1) * PLAN_CELL}`} />
        ))}
      </g>
      <rect x={0} y={0} width={width} height={height} fill="none" stroke="#ffffff" strokeWidth={5} />
      {room.windows.map((window) =>
        window.wall === "back" ? (
          <g key={`wb${window.from}`}>
            <rect
              x={window.from * PLAN_CELL + 6}
              y={-7}
              width={(window.to - window.from) * PLAN_CELL - 12}
              height={14}
              fill="#bfe3f6"
              stroke="#ffffff"
              strokeWidth={2}
            />
            <text
              x={((window.from + window.to) / 2) * PLAN_CELL}
              y={-12}
              textAnchor="middle"
              className="is-plan__label"
            >
              window
            </text>
          </g>
        ) : (
          <g key={`ws${window.from}`}>
            <rect
              x={-7}
              y={window.from * PLAN_CELL + 6}
              width={14}
              height={(window.to - window.from) * PLAN_CELL - 12}
              fill="#bfe3f6"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </g>
        ),
      )}
      {room.roofWindow ? (
        <g>
          <rect
            x={width / 2 - PLAN_CELL}
            y={8}
            width={PLAN_CELL * 2}
            height={PLAN_CELL * 0.6}
            rx={6}
            fill="none"
            stroke="#bfe3f6"
            strokeWidth={2.5}
            strokeDasharray="6 4"
          />
          <text x={width / 2} y={8 + PLAN_CELL * 0.4} textAnchor="middle" className="is-plan__label">
            roof window
          </text>
        </g>
      ) : null}
      <g>
        <rect x={doorX + 4} y={height - 4} width={PLAN_CELL * 2 - 8} height={8} fill="#3c6aa8" />
        <path
          d={`M${doorX + 4} ${height} L${doorX + 4} ${height - PLAN_CELL * 2 + 8} A${PLAN_CELL * 2 - 8} ${PLAN_CELL * 2 - 8} 0 0 1 ${doorX + PLAN_CELL * 2 - 4} ${height}`}
          fill="rgba(255,255,255,0.08)"
          stroke="#ffffff"
          strokeWidth={2}
          strokeDasharray="6 5"
        />
        <text x={doorX + PLAN_CELL} y={height + 18} textAnchor="middle" className="is-plan__label">
          door
        </text>
      </g>
      {children}
    </svg>
  );
});

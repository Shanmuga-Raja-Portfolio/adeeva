import { darken, lighten } from "../../../../ui/art/colourMix";
import { seededUnit } from "../../../../ui/art/seedFromText";
import type { FloorId } from "../../content/floor";
import { floorById } from "../../core";
import { floorPoint, floorQuad, pointsAttr, type CutawayFrame } from "./cutawayFrame";
import { BARE_FLOOR, roomHex } from "./roomHex";

interface CutawayFloorProps {
  readonly frame: CutawayFrame;
  readonly floorId: FloorId | null;
}

function Boards({ frame, base }: { frame: CutawayFrame; base: string }) {
  const bands = frame.rows * 2;
  const seam = darken(base, 0.28);
  return (
    <g stroke={seam} strokeWidth={Math.max(1, frame.scale * 1.2)} strokeLinecap="round">
      {Array.from({ length: bands }, (_, band) => {
        const top = band / 2;
        const start = (band % 2) * 1 + 0.5;
        const seams = Array.from({ length: frame.cols + 1 }, (_, step) => start + step * 2).filter(
          (x) => x < frame.cols,
        );
        const [ax, ay] = floorPoint(frame, 0, top + 0.5);
        const [bx, by] = floorPoint(frame, frame.cols, top + 0.5);
        return (
          <g key={band}>
            <line x1={ax} y1={ay} x2={bx} y2={by} />
            {seams.map((x) => {
              const [sx, sy] = floorPoint(frame, x, top);
              const [ex, ey] = floorPoint(frame, x, top + 0.5);
              return <line key={x} x1={sx} y1={sy} x2={ex} y2={ey} />;
            })}
            {Array.from({ length: frame.cols }, (_, column) => {
              const grain = seededUnit(band * 31 + column, 3);
              if (grain < 0.55) return null;
              const [gx, gy] = floorPoint(frame, column + 0.2 + grain * 0.4, top + 0.25);
              return (
                <path
                  key={column}
                  d={`M${gx} ${gy} q${frame.cell * 0.12} ${-frame.depth * 0.08} ${frame.cell * 0.28} 0`}
                  fill="none"
                  stroke={lighten(base, 0.2)}
                  strokeWidth={Math.max(1, frame.scale)}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

function Tiles({ frame, base, carpet }: { frame: CutawayFrame; base: string; carpet: boolean }) {
  const grout = carpet ? darken(base, 0.12) : lighten(base, 0.45);
  return (
    <g stroke={grout} strokeWidth={Math.max(1, frame.scale * (carpet ? 1 : 2))}>
      {Array.from({ length: frame.rows - 1 }, (_, row) => {
        const [ax, ay] = floorPoint(frame, 0, row + 1);
        const [bx, by] = floorPoint(frame, frame.cols, row + 1);
        return <line key={`r${row}`} x1={ax} y1={ay} x2={bx} y2={by} />;
      })}
      {Array.from({ length: frame.cols - 1 }, (_, column) => {
        const [ax, ay] = floorPoint(frame, column + 1, 0);
        const [bx, by] = floorPoint(frame, column + 1, frame.rows);
        return <line key={`c${column}`} x1={ax} y1={ay} x2={bx} y2={by} />;
      })}
    </g>
  );
}

function Checker({ frame }: { frame: CutawayFrame }) {
  return (
    <g>
      {Array.from({ length: frame.cols * frame.rows }, (_, index) => {
        const column = index % frame.cols;
        const row = Math.floor(index / frame.cols);
        if ((column + row) % 2 === 1) return null;
        return (
          <polygon key={index} points={pointsAttr(floorQuad(frame, column, row, 1, 1))} fill="#2a2730" />
        );
      })}
    </g>
  );
}

export function CutawayFloor({ frame, floorId }: CutawayFloorProps) {
  const outline = floorQuad(frame, 0, 0, frame.cols, frame.rows);
  if (floorId === null)
    return <polygon points={pointsAttr(outline)} fill={BARE_FLOOR} stroke="#8f867f" strokeWidth={1.5} />;
  const floor = floorById(floorId);
  const base = floor.pattern === "checker" ? "#f4ecd8" : roomHex(floor.colours[0] ?? "ivory");
  return (
    <g>
      <polygon points={pointsAttr(outline)} fill={base} />
      {floor.pattern === "boards" ? <Boards frame={frame} base={base} /> : null}
      {floor.pattern === "tiles" ? (
        <Tiles frame={frame} base={base} carpet={floorId === "cloud-carpet"} />
      ) : null}
      {floor.pattern === "checker" ? <Checker frame={frame} /> : null}
      <polygon points={pointsAttr(outline)} fill="none" stroke={darken(base, 0.35)} strokeWidth={1.5} />
    </g>
  );
}

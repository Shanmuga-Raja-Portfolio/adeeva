import type { ReactNode } from "react";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { Knot } from "../../core";
import type { WoodId } from "../../content/wood";
import { woodLook } from "./woodLook";
import { WoodPattern } from "./WoodPattern";

interface BoardSurfaceProps {
  readonly woodId: WoodId;
  readonly width: number;
  readonly height: number;
  readonly knots: readonly Knot[];
  readonly seed: number;
  readonly x?: number | undefined;
  readonly y?: number | undefined;
  readonly tile?: number | undefined;
  readonly children?: ReactNode;
}

function KnotArt({ knot, woodId }: { readonly knot: Knot; readonly woodId: WoodId }) {
  const look = woodLook(woodId);
  return (
    <g className="ww-knot">
      <ellipse cx={knot.x} cy={knot.y} rx={knot.r * 1.25} ry={knot.r} fill={look.line} opacity={0.6} />
      <ellipse cx={knot.x} cy={knot.y} rx={knot.r * 0.9} ry={knot.r * 0.72} fill={look.knot} />
      <ellipse cx={knot.x} cy={knot.y} rx={knot.r * 0.45} ry={knot.r * 0.36} fill="#2a1a12" opacity={0.8} />
      <path
        d={`M${knot.x - knot.r * 2.4} ${knot.y - knot.r * 1.2} Q${knot.x} ${knot.y - knot.r * 2} ${knot.x + knot.r * 2.4} ${knot.y - knot.r * 1.2}`}
        stroke={look.deep}
        strokeWidth={knot.r * 0.12}
        fill="none"
        opacity={0.6}
      />
    </g>
  );
}

export function BoardSurface({
  woodId,
  width,
  height,
  knots,
  seed,
  x = 0,
  y = 0,
  tile = 12,
  children,
}: BoardSurfaceProps) {
  const id = useSvgId("ww-board");
  const clipId = useSvgId("ww-board-edge");
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <WoodPattern id={id} look={woodLook(woodId)} seed={seed} tile={tile} />
      </defs>
      <rect width={width} height={height} rx={0.8} fill={`url(#${id})`} stroke="#2f2622" strokeWidth={0.6} />
      <rect width={width} height={height * 0.18} fill="#ffffff" opacity={0.12} />
      <clipPath id={clipId}>
        <rect width={width} height={height} rx={0.8} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {knots.map((knot, index) => (
          <KnotArt key={index} knot={knot} woodId={woodId} />
        ))}
      </g>
      {children}
    </g>
  );
}

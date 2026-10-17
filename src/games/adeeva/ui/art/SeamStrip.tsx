import type { Cloth } from "../../../../ui/art/cloth/Cloth";
import { seamLineAt } from "../../core/seamLine";
import { darken } from "../../../../ui/art/colourMix";
import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../ui/art/useSvgId";

export const SEAM_VIEW = {
  width: 300,
  height: 400,
  centreX: 150,
  needleY: 250,
  amplitude: 80,
  segment: 70,
  stripHalfWidth: 112,
} as const;

export interface SeamStripProps {
  profile: readonly number[];
  scroll: number;
  bandWidth: number;
  offsetX?: number | undefined;
  sewnUntil?: number | undefined;
  fabric?: Cloth | undefined;
  threadColour?: string | undefined;
}

export function seamLength(profile: readonly number[]): number {
  return Math.max(1, profile.length - 1) * SEAM_VIEW.segment;
}

function seamPath(profile: readonly number[], from: number, to: number): string {
  const length = seamLength(profile);
  const start = Math.max(0, from) * length;
  const end = Math.min(1, to) * length;
  if (end <= start) return "";
  const points: string[] = [];
  for (let s = start; s <= end + 0.01; s += 4) {
    const along = Math.min(s, end);
    const x = SEAM_VIEW.centreX + seamLineAt(profile, along / length) * SEAM_VIEW.amplitude;
    const y = SEAM_VIEW.needleY - along;
    points.push(`${points.length === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
}

export function seamThread(fabric: Cloth | undefined, threadColour?: string): string {
  if (threadColour !== undefined) return threadColour;
  return fabric ? darken(fabricLook(fabric).base, 0.5) : "#a93d63";
}

export function SeamStrip({
  profile,
  scroll,
  bandWidth,
  offsetX = 0,
  sewnUntil,
  fabric,
  threadColour,
}: SeamStripProps) {
  const id = useSvgId("seam");
  const length = seamLength(profile);
  const look = fabric ? fabricLook(fabric) : undefined;
  const base = look ? look.base : "#f1e7d6";
  const chalk = look && look.dark ? "#fff6e6" : "#3a6fb0";
  const thread = seamThread(fabric, threadColour);
  const sewn = Math.min(1, Math.max(0, sewnUntil ?? scroll));
  const top = SEAM_VIEW.needleY - length - SEAM_VIEW.height;
  const bottom = SEAM_VIEW.needleY + SEAM_VIEW.height;
  const left = SEAM_VIEW.centreX - SEAM_VIEW.stripHalfWidth;
  const right = SEAM_VIEW.centreX + SEAM_VIEW.stripHalfWidth;
  const band = Math.max(1, bandWidth * SEAM_VIEW.amplitude * 2);
  return (
    <g className="ad-seam-strip">
      <defs>{fabric ? <FabricPattern id={`${id}-fabric`} fabric={fabric} tile={26} /> : null}</defs>
      <g transform={`translate(${offsetX * SEAM_VIEW.amplitude} ${scroll * length})`}>
        <rect
          x={left + 4}
          y={top}
          width={SEAM_VIEW.stripHalfWidth * 2}
          height={bottom - top}
          fill="#1c1220"
          opacity={0.18}
        />
        <rect
          x={left}
          y={top}
          width={SEAM_VIEW.stripHalfWidth * 2}
          height={bottom - top}
          fill={fabric ? fabricFill(`${id}-fabric`) : base}
        />
        {fabric ? (
          <rect
            x={left}
            y={top}
            width={SEAM_VIEW.stripHalfWidth * 2}
            height={bottom - top}
            fill={fabricSheenFill(`${id}-fabric`)}
            opacity={0.6}
          />
        ) : null}
        <rect
          x={left}
          y={top}
          width={SEAM_VIEW.stripHalfWidth * 2}
          height={bottom - top}
          fill="#fffaf3"
          opacity={0.32}
        />
        <path
          d={`M${left + 3} ${top} V${bottom} M${right - 3} ${top} V${bottom}`}
          stroke={darken(base, 0.35)}
          strokeWidth={1}
          strokeDasharray="2 3"
          opacity={0.6}
        />
        <path
          d={seamPath(profile, 0, 1)}
          fill="none"
          stroke="#d0587e"
          strokeOpacity={0.16}
          strokeWidth={band}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={seamPath(profile, 0, 1)}
          fill="none"
          stroke="#d0587e"
          strokeOpacity={0.35}
          strokeWidth={band}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1 7"
        />
        <path
          d={seamPath(profile, 0, 1)}
          fill="none"
          stroke={look && look.dark ? "#1c1220" : "#ffffff"}
          strokeOpacity={0.85}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={seamPath(profile, sewn, 1)}
          fill="none"
          stroke={chalk}
          strokeWidth={3}
          strokeDasharray="8 5"
          strokeLinecap="round"
        />
        <path
          d={seamPath(profile, 0, sewn)}
          fill="none"
          stroke={thread}
          strokeWidth={3.2}
          strokeDasharray="6 3"
          strokeLinecap="round"
        />
        <circle
          cx={SEAM_VIEW.centreX + seamLineAt(profile, 1) * SEAM_VIEW.amplitude}
          cy={SEAM_VIEW.needleY - length}
          r={5}
          fill="none"
          stroke={chalk}
          strokeWidth={2}
        />
        <path
          d={`M${SEAM_VIEW.centreX + seamLineAt(profile, 1) * SEAM_VIEW.amplitude - 4} ${SEAM_VIEW.needleY - length - 4} l8 8 m0 -8 l-8 8`}
          stroke={chalk}
          strokeWidth={1.6}
        />
      </g>
    </g>
  );
}

import { memo } from "react";
import type { Cloth } from "../../../../ui/art/cloth/Cloth";
import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface ScrapBundleProps {
  readonly cloth: Cloth;
  readonly ribbon: string;
  readonly tilt: number;
}

const DRAPE = "M-30 8 L30 8 Q34 40 28 74 L18 70 L8 78 L-4 70 L-16 79 L-28 72 Q-34 40 -30 8 Z";

function Bundle({ cloth, ribbon, tilt }: ScrapBundleProps) {
  const id = useSvgId("scrap-bundle");
  const look = fabricLook(cloth);
  return (
    <g transform={`rotate(${tilt} 0 -8)`}>
      <defs>
        <FabricPattern id={`${id}-fabric`} fabric={cloth} tile={16} />
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.22} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#2a1b10" stopOpacity={0.28} />
        </linearGradient>
      </defs>
      <path
        d="M0 -8 q7 0 7 -7 q0 -6 -7 -7"
        fill="none"
        stroke="#8a8f99"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <path d={DRAPE} fill="#3b2a1c" opacity={0.16} transform="translate(3 4)" />
      <path d={DRAPE} fill={fabricFill(`${id}-fabric`)} stroke={look.deep} strokeWidth={1.4} />
      <path d={DRAPE} fill={fabricSheenFill(`${id}-fabric`)} />
      <path d={DRAPE} fill={`url(#${id}-shade)`} />
      <path
        d="M-14 12 Q-18 44 -12 72 M8 12 Q12 46 6 74"
        fill="none"
        stroke={look.deep}
        strokeWidth={1.2}
        opacity={0.35}
      />
      <path d="M-26 0 L0 -10 L26 0 L30 10 L-30 10 Z" fill="#c99f72" />
      <path d="M-26 0 L0 -10 L26 0" fill="none" stroke="#e6c79c" strokeWidth={1.4} />
      <path d="M-31 30 Q0 38 31 30" fill="none" stroke={ribbon} strokeWidth={5} strokeLinecap="round" />
      <path d="M-4 33 q-10 -10 -14 0 q4 8 14 0 q10 -10 14 0 q-4 8 -14 0 Z" fill={ribbon} />
      <path d="M-2 34 l-6 14 M2 34 l6 13" stroke={ribbon} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

export const ScrapBundle = memo(Bundle);

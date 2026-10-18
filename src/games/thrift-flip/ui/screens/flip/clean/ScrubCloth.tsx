import { memo } from "react";
import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../../../ui/art/cloth/FabricPattern";
import type { FindDef } from "../../../../content/find";
import type { Stain } from "../../../../core";
import { findCloth } from "../../../art/findCloth";

export interface ScrubClothProps {
  readonly id: string;
  readonly find: FindDef;
  readonly stain: Stain;
  readonly span: number;
}

function Cloth({ id, find, stain, span }: ScrubClothProps) {
  const cloth = findCloth(find);
  const panel = find.panels[stain.panel] ?? find.panels[0];
  return (
    <g>
      <defs>
        <FabricPattern id={`${id}-fabric`} fabric={cloth} tile={5} />
        <pattern id={`${id}-grain`} width={8} height={1.6} patternUnits="userSpaceOnUse">
          <rect width={8} height={1.6} fill="#d8b98d" />
          <path d="M0 0.8 Q4 0.62 8 0.8" stroke="#c49f6f" strokeWidth={0.05} fill="none" />
        </pattern>
        <radialGradient id={`${id}-light`} cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.22} />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#3b2a1c" stopOpacity={0.22} />
        </radialGradient>
        <radialGradient id={`${id}-wet`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fffaf0" stopOpacity={0.78} />
          <stop offset="0.62" stopColor="#fffaf0" stopOpacity={0.62} />
          <stop offset="0.86" stopColor="#e9f3f6" stopOpacity={0.3} />
          <stop offset="1" stopColor="#fffaf0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect
        x={stain.cx - span}
        y={stain.cy - span}
        width={span * 2}
        height={span * 2}
        fill={`url(#${id}-grain)`}
      />
      {panel !== undefined ? (
        <>
          <rect
            x={0.5}
            y={0.7}
            width={panel.width}
            height={panel.height}
            rx={0.6}
            fill="#3b2a1c"
            opacity={0.28}
          />
          <rect width={panel.width} height={panel.height} rx={0.6} fill={fabricFill(`${id}-fabric`)} />
          <rect width={panel.width} height={panel.height} rx={0.6} fill={fabricSheenFill(`${id}-fabric`)} />
          <rect
            x={0.6}
            y={0.6}
            width={Math.max(0, panel.width - 1.2)}
            height={Math.max(0, panel.height - 1.2)}
            rx={0.4}
            fill="none"
            stroke="#3b2a1c"
            strokeOpacity={0.22}
            strokeWidth={1.2}
          />
          <rect
            x={1.3}
            y={1.3}
            width={Math.max(0, panel.width - 2.6)}
            height={Math.max(0, panel.height - 2.6)}
            fill="none"
            stroke="#fffaf0"
            strokeOpacity={0.75}
            strokeWidth={0.16}
            strokeDasharray="0.6 0.45"
          />
          <path
            d={`M${stain.cx - span * 0.5} ${stain.cy + span * 0.36} Q${stain.cx} ${stain.cy + span * 0.28} ${stain.cx + span * 0.5} ${stain.cy + span * 0.4}`}
            fill="none"
            stroke="#3b2a1c"
            strokeOpacity={0.1}
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          <path
            d={`M${stain.cx - span * 0.48} ${stain.cy - span * 0.34} Q${stain.cx - span * 0.1} ${stain.cy - span * 0.4} ${stain.cx + span * 0.3} ${stain.cy - span * 0.3}`}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.22}
            strokeWidth={0.7}
            strokeLinecap="round"
          />
        </>
      ) : null}
      <rect
        width={panel?.width ?? 0}
        height={panel?.height ?? 0}
        fill={`url(#${id}-light)`}
        pointerEvents="none"
      />
      <circle cx={stain.cx} cy={stain.cy} r={stain.radius * 1.42} fill={`url(#${id}-wet)`} />
      <circle
        cx={stain.cx}
        cy={stain.cy}
        r={stain.radius * 1.2}
        fill="none"
        stroke="#2c4466"
        strokeWidth={0.3}
        opacity={0.22}
      />
      <circle
        cx={stain.cx}
        cy={stain.cy}
        r={stain.radius * 1.2}
        fill="none"
        stroke="#ffffff"
        strokeWidth={0.2}
        strokeDasharray="0.7 0.5"
      />
    </g>
  );
}

export const ScrubCloth = memo(Cloth);

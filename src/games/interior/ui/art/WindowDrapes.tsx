import { darken, lighten } from "../../../../ui/art/colourMix";
import { floorPoint, type CutawayFrame } from "./cutawayFrame";

interface WindowDrapesProps {
  readonly frame: CutawayFrame;
  readonly from: number;
  readonly to: number;
  readonly top: number;
  readonly bottom: number;
  readonly fabric: string;
}

const INK = "#3b2a33";

function Drape({
  x,
  top,
  bottom,
  width,
  fabric,
  flip,
}: {
  x: number;
  top: number;
  bottom: number;
  width: number;
  fabric: string;
  flip: boolean;
}) {
  const dir = flip ? -1 : 1;
  const tie = top + (bottom - top) * 0.62;
  const waist = width * 0.45;
  const hem = bottom + (bottom - top) * 0.12;
  const shape = [
    `M${x} ${top}`,
    `L${x + dir * width} ${top}`,
    `Q${x + dir * width * 0.9} ${tie - (bottom - top) * 0.1} ${x + dir * waist} ${tie}`,
    `Q${x + dir * width * 1.05} ${hem - (bottom - top) * 0.08} ${x + dir * width * 0.95} ${hem}`,
    `L${x} ${hem}`,
    "Z",
  ].join(" ");
  const fold = (share: number) =>
    `M${x + dir * width * share} ${top + 2} Q${x + dir * width * share * 0.7} ${tie} ${x + dir * width * (share + 0.1)} ${hem - 2}`;
  return (
    <g>
      <path d={shape} fill={fabric} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
      <path d={fold(0.3)} fill="none" stroke={darken(fabric, 0.2)} strokeWidth={1.4} opacity={0.7} />
      <path d={fold(0.62)} fill="none" stroke={lighten(fabric, 0.35)} strokeWidth={1.2} opacity={0.8} />
      <rect
        x={flip ? x - waist - 3 : x + waist - 3}
        y={tie - 2}
        width={6}
        height={4}
        rx={2}
        fill={lighten(fabric, 0.5)}
        stroke={INK}
        strokeWidth={0.6}
      />
    </g>
  );
}

export function WindowDrapes({ frame, from, to, top, bottom, fabric }: WindowDrapesProps) {
  const [x1] = floorPoint(frame, from + 0.15, 0);
  const [x2] = floorPoint(frame, to - 0.15, 0);
  const width = Math.min(frame.cell * 0.42, (x2 - x1) * 0.32);
  const rodY = top - frame.wall * 0.05;
  return (
    <g pointerEvents="none">
      <path
        d={`M${x1 - width * 1.15} ${rodY} L${x2 + width * 1.15} ${rodY}`}
        stroke="#7a5a3c"
        strokeWidth={Math.max(1.5, frame.scale * 3)}
        strokeLinecap="round"
      />
      <circle
        cx={x1 - width * 1.2}
        cy={rodY}
        r={Math.max(1.6, frame.scale * 3.2)}
        fill="#c9a227"
        stroke={INK}
      />
      <circle
        cx={x2 + width * 1.2}
        cy={rodY}
        r={Math.max(1.6, frame.scale * 3.2)}
        fill="#c9a227"
        stroke={INK}
      />
      <Drape x={x1 - width * 0.9} top={rodY} bottom={bottom} width={width} fabric={fabric} flip={false} />
      <Drape x={x2 + width * 0.9} top={rodY} bottom={bottom} width={width} fabric={fabric} flip />
    </g>
  );
}

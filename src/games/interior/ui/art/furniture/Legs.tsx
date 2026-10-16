import { darken } from "../../../../../ui/art/colourMix";
import { INK } from "./spriteBox";

export function Legs({ w, h, u, line }: { w: number; h: number; u: number; line: number }) {
  const leg = Math.max(2, u * 0.06);
  return (
    <g fill={darken("#8a6a4a", 0.2)} stroke={INK} strokeWidth={line * 0.6}>
      <rect x={-w / 2 + leg} y={-h} width={leg} height={h} rx={leg / 3} />
      <rect x={w / 2 - leg * 2} y={-h} width={leg} height={h} rx={leg / 3} />
    </g>
  );
}

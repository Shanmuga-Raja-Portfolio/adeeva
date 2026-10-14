import { seededUnit } from "../../../../ui/art/seedFromText";

export interface Shaving {
  readonly id: number;
  readonly x: number;
  readonly y: number;
}

interface ShavingsProps {
  readonly shavings: readonly Shaving[];
  readonly colour: string;
  readonly unit: number;
}

export function Shavings({ shavings, colour, unit }: ShavingsProps) {
  return (
    <g aria-hidden="true">
      {shavings.map((shaving) => {
        const dx = (seededUnit(shaving.id, 1) - 0.5) * 6 * unit;
        const spin = Math.round(seededUnit(shaving.id, 2) * 360);
        return (
          <g key={shaving.id} transform={`translate(${shaving.x} ${shaving.y})`}>
            <path
              className="jb-shaving"
              style={{ ["--jb-fall-x" as string]: `${dx}px`, ["--jb-spin" as string]: `${spin}deg` }}
              d={`M0 0 l${unit * 0.9} ${-unit * 0.4} l${unit * 0.3} ${unit * 0.6} Z`}
              fill={colour}
              stroke="#ffffff"
              strokeWidth={unit * 0.08}
            />
          </g>
        );
      })}
    </g>
  );
}

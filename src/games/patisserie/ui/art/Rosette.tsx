import { darken, lighten } from "../../../../ui/art/colourMix";
import type { RibbonId } from "../../content/ribbon";
import { ribbonById } from "../../core";

export interface RosetteProps {
  readonly ribbon: RibbonId | null;
  readonly size: number;
  readonly title?: string | undefined;
}

const PETALS = Array.from({ length: 14 }, (_, index) => index);

export function Rosette({ ribbon, size, title }: RosetteProps) {
  if (ribbon === null)
    return (
      <svg width={size} height={size} viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
        <circle cx={0} cy={-34} r={4} fill="#a58b5e" />
        <circle r={24} fill="none" stroke="#d6c8b0" strokeWidth={3} strokeDasharray="6 6" />
      </svg>
    );
  const def = ribbonById(ribbon);
  const colour = def.colour;
  const gold = ribbon === "rosette";
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      role={title === undefined ? undefined : "img"}
      aria-label={title}
      aria-hidden={title === undefined ? true : undefined}
      focusable="false"
    >
      <path d="M-12 8 L-24 46 L-14 40 L-8 50 L2 12 Z" fill={darken(colour, 0.12)} />
      <path d="M12 8 L24 46 L14 40 L8 50 L-2 12 Z" fill={colour} />
      {PETALS.map((index) => (
        <ellipse
          key={index}
          cx={0}
          cy={-24}
          rx={8}
          ry={13}
          fill={index % 2 === 0 ? colour : lighten(colour, 0.25)}
          stroke={darken(colour, 0.25)}
          strokeWidth={1}
          transform={`rotate(${(index * 360) / PETALS.length})`}
        />
      ))}
      <circle
        r={20}
        fill={gold ? "#e2b93b" : lighten(colour, 0.45)}
        stroke={darken(colour, 0.3)}
        strokeWidth={2}
      />
      <circle r={14} fill={gold ? "#fff3c4" : "#fffaf2"} stroke={darken(colour, 0.2)} strokeWidth={1} />
      <path
        d="M0 -8 L2.4 -2.6 8 -2.4 3.6 1.2 5 7 0 3.8 -5 7 -3.6 1.2 -8 -2.4 -2.4 -2.6 Z"
        fill={gold ? "#c2304f" : colour}
      />
    </svg>
  );
}

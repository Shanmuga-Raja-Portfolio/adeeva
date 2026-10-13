import type { CSSProperties } from "react";
import type { Point } from "../../../content/garmentPart";
import { seededUnit } from "../../art/seedFromText";

export interface SnipParticlesProps {
  readonly samples: readonly Point[];
  readonly seed: number;
  readonly colour: string;
  readonly unit: number;
  readonly every?: number | undefined;
  readonly keep?: number | undefined;
}

export function SnipParticles({ samples, seed, colour, unit, every = 7, keep = 14 }: SnipParticlesProps) {
  const total = Math.floor(samples.length / every);
  const first = Math.max(0, total - keep);
  const particles: { index: number; point: Point }[] = [];
  for (let index = first; index < total; index += 1) {
    const point = samples[index * every];
    if (point !== undefined) particles.push({ index, point });
  }
  return (
    <g className="ad-snips" pointerEvents="none" aria-hidden="true">
      {particles.map(({ index, point }) => {
        const angle = seededUnit(seed, index) * Math.PI * 2;
        const reach = (18 + seededUnit(seed, index + 977) * 26) * unit;
        const spin = Math.round((seededUnit(seed, index + 31) - 0.5) * 540);
        const style = {
          "--snip-dx": `${Math.cos(angle) * reach}px`,
          "--snip-dy": `${Math.sin(angle) * reach + 14 * unit}px`,
          "--snip-spin": `${spin}deg`,
        } as CSSProperties;
        return (
          <g key={index} transform={`translate(${point[0]} ${point[1]})`}>
            <path
              className="ad-snip"
              style={style}
              d={`M${-3 * unit} 0 q ${1.5 * unit} ${-2 * unit} ${3 * unit} 0 t ${3 * unit} 0`}
              fill="none"
              stroke={colour}
              strokeWidth={1.6 * unit}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}

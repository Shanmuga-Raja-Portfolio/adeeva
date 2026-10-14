import { seededUnit } from "../../../../ui/art/seedFromText";
import type { WoodLook } from "./woodLook";

interface WoodPatternProps {
  readonly id: string;
  readonly look: WoodLook;
  readonly seed: number;
  readonly tile?: number | undefined;
  readonly turned?: boolean | undefined;
}

function wavyLine(seed: number, index: number, y: number, width: number, amplitude: number): string {
  const phase = seededUnit(seed, index) * Math.PI * 2;
  const wave = 1 + Math.floor(seededUnit(seed, index + 40) * 2);
  const steps = 12;
  const points = Array.from({ length: steps + 1 }, (_, step) => {
    const x = (width * step) / steps;
    const dy = Math.sin(phase + (step / steps) * Math.PI * 2 * wave) * amplitude;
    return `${x.toFixed(1)} ${(y + dy).toFixed(2)}`;
  });
  return `M${points.join(" L")}`;
}

export function WoodPattern({ id, look, seed, tile = 40, turned = false }: WoodPatternProps) {
  const width = tile * 3;
  const height = tile;
  const lines = Array.from({ length: 7 }, (_, index) => ({
    path: wavyLine(seed, index, ((index + 0.5) * height) / 7, width, height * 0.035),
    weight: 0.6 + seededUnit(seed, index + 80) * 0.9,
    shade: seededUnit(seed, index + 120) > 0.5 ? look.line : look.deep,
  }));
  return (
    <pattern
      id={id}
      patternUnits="userSpaceOnUse"
      width={width}
      height={height}
      patternTransform={turned ? "rotate(90)" : undefined}
    >
      <rect width={width} height={height} fill={look.base} />
      <rect width={width} height={height * 0.42} y={height * 0.08} fill={look.light} opacity={0.35} />
      {lines.map((line, index) => (
        <path
          key={index}
          d={line.path}
          stroke={line.shade}
          strokeWidth={(line.weight * tile) / 40}
          strokeOpacity={0.55}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </pattern>
  );
}

import { seededUnit } from "../../../../ui/art/seedFromText";
import type { WoodLook } from "./woodLook";

interface WoodPatternProps {
  readonly id: string;
  readonly look: WoodLook;
  readonly seed: number;
  readonly tile?: number | undefined;
  readonly turned?: boolean | undefined;
}

const LINES = 11;
const BANDS = 5;
const PORES = 22;

function wavyLine(seed: number, index: number, y: number, width: number, amplitude: number): string {
  const phase = seededUnit(seed, index) * Math.PI * 2;
  const wave = 1 + Math.floor(seededUnit(seed, index + 40) * 2);
  const steps = 18;
  const points = Array.from({ length: steps + 1 }, (_, step) => {
    const x = (width * step) / steps;
    const dy = Math.sin(phase + (step / steps) * Math.PI * 2 * wave) * amplitude;
    return `${x.toFixed(1)} ${(y + dy).toFixed(2)}`;
  });
  return `M${points.join(" L")}`;
}

function cathedral(x0: number, tip: number, centre: number, half: number): string {
  const bend = (tip - x0) * 0.55;
  return `M${x0.toFixed(1)} ${(centre - half).toFixed(1)} C${(tip - bend).toFixed(1)} ${(centre - half).toFixed(1)} ${tip.toFixed(1)} ${(centre - half * 0.35).toFixed(1)} ${tip.toFixed(1)} ${centre.toFixed(1)} C${tip.toFixed(1)} ${(centre + half * 0.35).toFixed(1)} ${(tip - bend).toFixed(1)} ${(centre + half).toFixed(1)} ${x0.toFixed(1)} ${(centre + half).toFixed(1)}`;
}

export function WoodPattern({ id, look, seed, tile = 40, turned = false }: WoodPatternProps) {
  const width = tile * 6;
  const height = tile * 1.5;
  const scale = tile / 40;
  const spots = Array.from({ length: LINES }, (_, index) => index + 0.2 + seededUnit(seed, index + 200) * 0.6)
    .map((spot) => 0.05 * height + (spot / LINES) * height * 0.9)
    .sort((a, b) => a - b);
  const lines = spots.map((y, index) => ({
    path: wavyLine(seed, index, y, width, height * (0.008 + seededUnit(seed, index + 160) * 0.018)),
    weight: 0.5 + seededUnit(seed, index + 80) * 1.1,
    shade: seededUnit(seed, index + 120) > 0.55 ? look.deep : look.line,
    alpha: 0.32 + seededUnit(seed, index + 140) * 0.32,
  }));
  const bands = Array.from({ length: BANDS }, (_, index) => ({
    y: (index / BANDS) * height + seededUnit(seed, index + 300) * height * 0.08,
    h: height * (0.06 + seededUnit(seed, index + 320) * 0.1),
    light: index % 2 === 0,
  }));
  const tipX = width * (0.55 + seededUnit(seed, 400) * 0.25);
  const centre = height * (0.38 + seededUnit(seed, 401) * 0.24);
  const pores = Array.from({ length: PORES }, (_, index) => ({
    x: seededUnit(seed, index + 500) * width,
    y: height * 0.04 + seededUnit(seed, index + 540) * height * 0.92,
    l: (2 + seededUnit(seed, index + 580) * 5) * scale,
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
      {bands.map((band, index) => (
        <rect
          key={`band-${index}`}
          y={band.y}
          width={width}
          height={band.h}
          fill={band.light ? look.light : look.line}
          opacity={band.light ? 0.3 : 0.14}
        />
      ))}
      {[1, 0.72, 0.46].map((share) => (
        <path
          key={`arch-${share}`}
          d={cathedral(
            width * 0.12,
            width * 0.12 + (tipX - width * 0.12) * share,
            centre,
            height * 0.2 * share,
          )}
          stroke={look.deep}
          strokeWidth={0.9 * scale}
          strokeOpacity={0.32}
          fill="none"
        />
      ))}
      {lines.map((line, index) => (
        <path
          key={index}
          d={line.path}
          stroke={line.shade}
          strokeWidth={line.weight * scale}
          strokeOpacity={line.alpha}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {pores.map((pore, index) => (
        <path
          key={`pore-${index}`}
          d={`M${pore.x.toFixed(1)} ${pore.y.toFixed(1)} h${pore.l.toFixed(1)}`}
          stroke={look.deep}
          strokeWidth={0.7 * scale}
          strokeOpacity={0.28}
          strokeLinecap="round"
        />
      ))}
    </pattern>
  );
}

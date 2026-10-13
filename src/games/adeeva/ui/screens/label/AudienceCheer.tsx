import { seededUnit } from "../../../../../ui/art/seedFromText";

export interface AudienceCheerProps {
  intensity: number;
  t: number;
  seed: number;
  heart: string;
}

const LIFE = 0.24;

function heartPath(size: number): string {
  const s = size;
  return `M0 ${s * 0.35} C${-s * 0.9} ${-s * 0.25} ${-s * 0.45} ${-s * 0.95} 0 ${-s * 0.42} C${s * 0.45} ${-s * 0.95} ${s * 0.9} ${-s * 0.25} 0 ${s * 0.35} Z`;
}

function sparklePath(size: number): string {
  const s = size;
  const k = s * 0.16;
  return `M0 ${-s} Q${k} ${-k} ${s} 0 Q${k} ${k} 0 ${s} Q${-k} ${k} ${-s} 0 Q${-k} ${-k} 0 ${-s} Z`;
}

export function AudienceCheer({ intensity, t, seed, heart }: AudienceCheerProps) {
  const count = Math.round(6 + 26 * intensity);
  const particles = Array.from({ length: count }, (_, index) => {
    const spawn = 0.22 + 0.6 * seededUnit(seed, index * 7);
    const age = (t - spawn) / LIFE;
    if (age < 0 || age > 1) return null;
    const left = index % 2 === 0;
    const x0 = left
      ? 130 + seededUnit(seed, index * 7 + 1) * 430
      : 1040 + seededUnit(seed, index * 7 + 1) * 430;
    const y0 = 560 + seededUnit(seed, index * 7 + 2) * 250;
    const rise = 120 + seededUnit(seed, index * 7 + 3) * 110;
    const sway = Math.sin(age * Math.PI * 2 + index) * 14;
    const size = 12 + seededUnit(seed, index * 7 + 4) * 14 * (0.7 + intensity * 0.6);
    const sparkle = index % 3 === 0;
    const opacity = Math.sin(Math.PI * Math.min(1, age * 1.15));
    const scale = 0.6 + 0.4 * Math.min(1, age * 3);
    return (
      <g
        key={index}
        transform={`translate(${(x0 + sway).toFixed(1)} ${(y0 - rise * age).toFixed(1)}) scale(${scale.toFixed(3)})`}
        opacity={opacity.toFixed(3)}
      >
        {sparkle ? (
          <path d={sparklePath(size)} fill="#ffe9a8" />
        ) : (
          <path d={heartPath(size)} fill={heart} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={1.5} />
        )}
      </g>
    );
  });
  return <g className="ad-show__cheer">{particles}</g>;
}

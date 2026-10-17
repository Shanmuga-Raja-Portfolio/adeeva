import { seededUnit } from "../../../../../ui/art/seedFromText";

export interface AudienceCheerProps {
  intensity: number;
  t: number;
  seed: number;
  heart: string;
}

const LIFE = 0.24;
const FLASH_LIFE = 0.035;

function heartPath(size: number): string {
  const s = size;
  return `M0 ${s * 0.35} C${-s * 0.9} ${-s * 0.25} ${-s * 0.45} ${-s * 0.95} 0 ${-s * 0.42} C${s * 0.45} ${-s * 0.95} ${s * 0.9} ${-s * 0.25} 0 ${s * 0.35} Z`;
}

function sparklePath(size: number): string {
  const s = size;
  const k = s * 0.16;
  return `M0 ${-s} Q${k} ${-k} ${s} 0 Q${k} ${k} 0 ${s} Q${-k} ${k} ${-s} 0 Q${-k} ${-k} 0 ${-s} Z`;
}

function Flashes({ intensity, t, seed }: Omit<AudienceCheerProps, "heart">) {
  const count = Math.round(10 + 26 * intensity);
  return (
    <g className="ad-show__flashes">
      {Array.from({ length: count }, (_, index) => {
        const spawn = 0.18 + 0.72 * seededUnit(seed + 5, index * 5);
        const age = (t - spawn) / FLASH_LIFE;
        if (age < 0 || age > 1) return null;
        const left = index % 2 === 0;
        const x = left
          ? 60 + seededUnit(seed + 5, index * 5 + 1) * 520
          : 1020 + seededUnit(seed + 5, index * 5 + 1) * 520;
        const y = 440 + seededUnit(seed + 5, index * 5 + 2) * 330;
        const glow = 0.85 * Math.sin(Math.PI * age);
        const size = 10 + seededUnit(seed + 5, index * 5 + 3) * 10;
        return (
          <g key={index} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} opacity={glow.toFixed(3)}>
            <circle r={size * 0.6} fill="#fff6dc" />
            <path d={sparklePath(size * 1.9)} fill="#fffbe8" />
          </g>
        );
      })}
    </g>
  );
}

export function AudienceCheer({ intensity, t, seed, heart }: AudienceCheerProps) {
  const count = Math.round(20 + 44 * intensity);
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
    const size = 18 + seededUnit(seed, index * 7 + 4) * 18 * (0.7 + intensity * 0.6);
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
          <path d={sparklePath(size)} fill="#fff1bf" stroke="#e2b93b" strokeWidth={1.2} />
        ) : (
          <g>
            <path d={heartPath(size)} fill={heart} stroke="#ffffff" strokeWidth={2.6} />
            <ellipse
              cx={-size * 0.3}
              cy={-size * 0.38}
              rx={size * 0.16}
              ry={size * 0.1}
              fill="#ffffff"
              opacity={0.8}
              transform={`rotate(-35 ${(-size * 0.3).toFixed(1)} ${(-size * 0.38).toFixed(1)})`}
            />
          </g>
        )}
      </g>
    );
  });
  return (
    <g className="ad-show__cheer">
      <Flashes intensity={intensity} t={t} seed={seed} />
      {particles}
    </g>
  );
}

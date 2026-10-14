import type { StoneCut } from "../../content/stone";
import { clawCount } from "../../core";
import type { MetalLook } from "./metalLook";
import { StoneArt } from "./StoneArt";

interface StoneSeatArtProps {
  readonly cut: StoneCut;
  readonly hex: string | null;
  readonly metal: MetalLook;
  readonly fill: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly twinkle: boolean;
}

export function clawAngles(cut: StoneCut): number[] {
  const count = clawCount(cut);
  const start = count === 3 ? -90 : -45;
  return Array.from({ length: count }, (_, index) => start + (360 / count) * index);
}

export function StoneSeatArt({ cut, hex, metal, fill, x, y, size, twinkle }: StoneSeatArtProps) {
  const radius = size * 0.5;
  return (
    <g>
      <circle cx={x} cy={y} r={radius * 1.08} fill={fill} stroke={metal.line} strokeWidth={1.2} />
      {hex === null ? (
        <circle cx={x} cy={y} r={radius * 0.8} fill="#2a1d2c" fillOpacity={0.25} />
      ) : (
        <StoneArt cut={cut} hex={hex} x={x} y={y} size={size} twinkle={twinkle} />
      )}
      {hex === null
        ? null
        : clawAngles(cut).map((angle) => {
            const radians = (angle * Math.PI) / 180;
            const cx = x + Math.cos(radians) * radius * 0.86;
            const cy = y + Math.sin(radians) * radius * 0.86;
            return (
              <ellipse
                key={angle}
                cx={cx}
                cy={cy}
                rx={size * 0.07}
                ry={size * 0.11}
                transform={`rotate(${angle + 90} ${cx} ${cy})`}
                fill={fill}
                stroke={metal.line}
                strokeWidth={0.9}
              />
            );
          })}
    </g>
  );
}

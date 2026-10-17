import { useSvgId } from "../../../../ui/art/useSvgId";
import type { BackdropId } from "../../content/lookbookBackdrop";
import { backdropById } from "../../core";

interface BackdropArtProps {
  readonly backdrop: BackdropId;
  readonly width?: number | undefined;
  readonly height?: number | undefined;
}

export function BackdropArt({ backdrop, width = 240, height = 240 }: BackdropArtProps) {
  const id = useSvgId("jb-backdrop");
  const def = backdropById(backdrop);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-light`} cx="0.5" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.22} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.22} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill={def.base} />
      {backdrop === "teal-velvet"
        ? Array.from({ length: 12 }, (_, index) => (
            <path
              key={index}
              d={`M${index * 22 - 10} 0 Q${index * 22 + 4} ${height / 2} ${index * 22 - 10} ${height}`}
              stroke={def.detail}
              strokeWidth={6}
              fill="none"
              opacity={0.6}
            />
          ))
        : null}
      {backdrop === "linen"
        ? Array.from({ length: 30 }, (_, index) => (
            <g key={index} opacity={0.5}>
              <path d={`M0 ${index * 8} L${width} ${index * 8 + 2}`} stroke={def.detail} strokeWidth={0.8} />
              <path d={`M${index * 8} 0 L${index * 8 + 2} ${height}`} stroke={def.detail} strokeWidth={0.6} />
            </g>
          ))
        : null}
      {backdrop === "slate"
        ? (
            [
              [20, 40, 70],
              [140, 30, 90],
              [60, 150, 110],
              [170, 170, 60],
            ] as const
          ).map(([x, y, w], index) => (
            <path
              key={index}
              d={`M${x} ${y} l${w} 6 l-8 ${w * 0.4} l-${w * 0.9} -4 Z`}
              fill={def.detail}
              opacity={0.55}
            />
          ))
        : null}
      {backdrop === "moon-paper" ? (
        <g>
          <path d="M184 44 A26 26 0 1 0 208 88 A20 20 0 1 1 184 44 Z" fill={def.detail} opacity={0.9} />
          {(
            [
              [30, 30],
              [70, 60],
              [40, 200],
              [210, 150],
              [130, 24],
              [200, 210],
              [16, 120],
            ] as const
          ).map(([x, y]) => (
            <path
              key={`${x}-${y}`}
              d={`M${x} ${y - 4} l1.4 2.6 l2.6 1.4 l-2.6 1.4 l-1.4 2.6 l-1.4 -2.6 l-2.6 -1.4 l2.6 -1.4 Z`}
              fill={def.detail}
            />
          ))}
        </g>
      ) : null}
      <rect width={width} height={height} fill={`url(#${id}-light)`} />
    </g>
  );
}

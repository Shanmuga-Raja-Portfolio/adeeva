import { colourById } from "../../../../engine/palette";
import { darken, lighten } from "../../../../ui/art/colourMix";
import type { WindowPropId } from "../../content/windowProp";
import { propById } from "../../core";

export interface PropArtProps {
  readonly propId: WindowPropId;
}

export const PROP_SIZE = 80;

export function PropArt({ propId }: PropArtProps) {
  const base = colourById(propById(propId).colour).hex;
  const deep = darken(base, 0.3);
  const light = lighten(base, 0.45);
  switch (propId) {
    case "book-stack":
      return (
        <g>
          <rect x={-30} y={14} width={60} height={14} rx={2} fill={base} stroke={deep} strokeWidth={2} />
          <rect x={-26} y={0} width={52} height={14} rx={2} fill="#e57a8f" stroke="#a84a5c" strokeWidth={2} />
          <rect
            x={-32}
            y={-14}
            width={58}
            height={14}
            rx={2}
            fill="#f6d36b"
            stroke="#b8902a"
            strokeWidth={2}
          />
          <path d="M-24 21 H20 M-20 7 H18 M-26 -7 H18" stroke="#fff8ec" strokeWidth={1.5} />
        </g>
      );
    case "paper-moon":
      return (
        <g>
          <path d="M0 -40 V-28" stroke="#8a6a4a" strokeWidth={1.5} />
          <path
            d="M8 -28 A28 28 0 1 0 8 28 A22 22 0 1 1 8 -28 Z"
            fill={base}
            stroke="#b79a6e"
            strokeWidth={2}
          />
          <circle cx={-12} cy={-4} r={3} fill="#e8d9bd" />
          <circle cx={-6} cy={12} r={2} fill="#e8d9bd" />
        </g>
      );
    case "wicker-basket":
      return (
        <g>
          <path d="M-22 -8 Q0 -40 22 -8" fill="none" stroke={deep} strokeWidth={4} />
          <path d="M-30 -8 L30 -8 L24 30 L-24 30 Z" fill={base} stroke={deep} strokeWidth={2} />
          {[-20, -10, 0, 10, 20].map((x) => (
            <path key={x} d={`M${x} -8 L${x * 0.8} 30`} stroke={deep} strokeWidth={1.4} />
          ))}
          {[2, 12, 22].map((y) => (
            <path key={y} d={`M-28 ${y} H28`} stroke={light} strokeWidth={1.4} />
          ))}
        </g>
      );
    case "potted-fern":
      return (
        <g>
          {[-50, -25, 0, 25, 50].map((angle) => (
            <path
              key={angle}
              d="M0 0 Q4 -24 0 -40"
              stroke={base}
              strokeWidth={7}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(${angle})`}
            />
          ))}
          <path d="M-18 0 L18 0 L14 30 L-14 30 Z" fill="#b86b46" stroke="#8a4f33" strokeWidth={2} />
        </g>
      );
    case "bike-wheel":
      return (
        <g>
          <circle r={34} fill="none" stroke={base} strokeWidth={6} />
          <circle r={28} fill="none" stroke="#3a3a40" strokeWidth={2} />
          {Array.from({ length: 12 }, (_, index) => (
            <path
              key={index}
              d="M0 0 L0 -28"
              stroke="#9aa0aa"
              strokeWidth={1.2}
              transform={`rotate(${index * 30})`}
            />
          ))}
          <circle r={5} fill={light} stroke={deep} strokeWidth={2} />
        </g>
      );
    case "string-lights":
      return (
        <g>
          <path d="M-38 -10 Q0 18 38 -10" fill="none" stroke="#5b4a3a" strokeWidth={2} />
          {[-28, -14, 0, 14, 28].map((x) => (
            <g key={x} className="tf-twinkle">
              <circle cx={x} cy={-4 + 0.012 * (38 * 38 - x * x)} r={9} fill={base} opacity={0.3} />
              <circle cx={x} cy={-4 + 0.012 * (38 * 38 - x * x)} r={4.5} fill={lighten(base, 0.5)} />
            </g>
          ))}
        </g>
      );
    case "suitcase":
      return (
        <g>
          <path d="M-12 -24 L-12 -32 L12 -32 L12 -24" fill="none" stroke={deep} strokeWidth={4} />
          <rect x={-34} y={-24} width={68} height={48} rx={6} fill={base} stroke={deep} strokeWidth={2} />
          <path d="M-20 -24 V24 M20 -24 V24" stroke={light} strokeWidth={4} />
          <rect x={-6} y={-4} width={12} height={8} rx={2} fill="#c9a227" />
        </g>
      );
    case "ladder-shelf":
      return (
        <g>
          <path d="M-24 34 L-12 -36 M24 34 L12 -36" stroke={deep} strokeWidth={4} strokeLinecap="round" />
          {[-20, 0, 20].map((y) => (
            <rect
              key={y}
              x={-22 + (y + 36) * 0.12}
              y={y}
              width={44 - (y + 36) * 0.24}
              height={5}
              fill={base}
            />
          ))}
          <circle cx={-6} cy={-26} r={6} fill="#8fcfb2" />
          <rect x={2} y={-8} width={8} height={8} fill="#f6d36b" />
        </g>
      );
  }
}

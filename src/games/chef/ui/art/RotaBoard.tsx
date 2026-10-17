import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface RotaBoardProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly staff: readonly AvatarLook[];
}

const PIN_COLOURS = ["#d9472b", "#4f8a3c", "#2e6fa8"];

export function RotaBoard({ x, y, width, height, staff }: RotaBoardProps) {
  const id = useSvgId("ck-rota");
  const faces = staff.slice(0, 3);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <filter id={`${id}-cork`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={2} seed={11} />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0 0.08  0 0 0 0.5 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <clipPath id={`${id}-photo`}>
          <rect x={-20} y={-22} width={40} height={40} rx={2} />
        </clipPath>
      </defs>
      <rect x={6} y={8} width={width} height={height} rx={8} fill="#1a0c06" opacity={0.4} />
      <rect width={width} height={height} rx={8} fill="#6a3a1c" />
      <rect x={7} y={7} width={width - 14} height={height - 14} rx={4} fill="#c8955a" />
      <rect
        x={7}
        y={7}
        width={width - 14}
        height={height - 14}
        rx={4}
        fill="#000000"
        filter={`url(#${id}-cork)`}
      />
      <g transform={`translate(${width / 2} 34) rotate(-3)`}>
        <rect x={-40} y={-17} width={80} height={32} rx={2} fill="#fffaf0" />
        <text
          y={7}
          textAnchor="middle"
          fontSize={20}
          fill="#2e3a40"
          className="ck-scene-label ck-scene-label--hand"
        >
          Team
        </text>
        <circle cy={-14} r={3.5} fill="#d9472b" />
      </g>
      {faces.map((look, index) => {
        const [cx, cy] = index === 2 ? [width / 2, 122] : [30 + index * 52, 82];
        return (
          <g key={index} transform={`translate(${cx} ${cy}) rotate(${index === 1 ? 5 : -4})`}>
            <rect x={-24} y={-26} width={48} height={54} rx={2} fill="#fffdf6" />
            <rect x={-20} y={-22} width={40} height={40} rx={2} fill="#f2d7a8" />
            <g clipPath={`url(#${id}-photo)`}>
              <g transform="translate(-49.5 -27) scale(0.25)">
                <AvatarFigure look={look} mood="delighted" />
              </g>
            </g>
            <circle cy={-24} r={3.5} fill={PIN_COLOURS[index] ?? "#d9472b"} />
          </g>
        );
      })}
    </g>
  );
}

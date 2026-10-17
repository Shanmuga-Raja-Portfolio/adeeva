import { useSvgId } from "../../../../ui/art/useSvgId";
import type { MetalLook } from "./metalLook";

interface MetalSheetProps {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly look: MetalLook;
}

const BRUSH_LINES = 26;

export function MetalSheet({ x, y, size, look }: MetalSheetProps) {
  const id = useSvgId("jb-sheet");
  const u = size / 100;
  const sheet = { x: x + u * 4, y: y + u * 3, w: u * 92, h: u * 86 };
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5d3e" />
          <stop offset="1" stopColor="#4a2e1a" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={look.light} />
          <stop offset="0.3" stopColor={look.mid} />
          <stop offset="0.52" stopColor={look.light} />
          <stop offset="0.78" stopColor={look.mid} />
          <stop offset="1" stopColor={look.dark} />
        </linearGradient>
        <radialGradient id={`${id}-lamp`} cx="0.36" cy="0.3" r="0.65">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.5} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0.12} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-shadow`} x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx={0} dy={u * 1.4} stdDeviation={u * 1.2} floodColor="#2a1d2c" floodOpacity={0.45} />
        </filter>
      </defs>
      <rect x={x} y={y} width={size} height={size} fill={`url(#${id}-wood)`} />
      {Array.from({ length: 7 }, (_, index) => (
        <path
          key={index}
          d={`M${x} ${y + u * (8 + index * 14)} Q${x + u * 50} ${y + u * (4 + index * 14)} ${x + size} ${y + u * (10 + index * 14)}`}
          fill="none"
          stroke="#3e2716"
          strokeOpacity={0.3}
          strokeWidth={u * 0.6}
        />
      ))}
      <path
        d={`M${x + u * 22} ${y + size} L${x + u * 34} ${y + u * 80} L${x + u * 66} ${y + u * 80} L${x + u * 78} ${y + size} Z`}
        fill="#a87b55"
        stroke="#553620"
        strokeWidth={u * 0.5}
      />
      <path
        d={`M${x + u * 44} ${y + u * 80} L${x + u * 50} ${y + u * 94} L${x + u * 56} ${y + u * 80} Z`}
        fill="#3e2716"
      />
      <g filter={`url(#${id}-shadow)`} transform={`rotate(-2 ${x + size / 2} ${y + size / 2})`}>
        <rect
          x={sheet.x}
          y={sheet.y}
          width={sheet.w}
          height={sheet.h}
          rx={u * 1.6}
          fill={`url(#${id}-metal)`}
        />
        <g stroke={look.light} strokeOpacity={0.4} strokeWidth={u * 0.18}>
          {Array.from({ length: BRUSH_LINES }, (_, index) => {
            const ly = sheet.y + u * 2 + (index * (sheet.h - u * 4)) / (BRUSH_LINES - 1);
            const inset = ((index * 37) % 11) * u;
            return (
              <path key={index} d={`M${sheet.x + inset} ${ly} L${sheet.x + sheet.w - u * 3 - inset} ${ly}`} />
            );
          })}
        </g>
        <g stroke={look.dark} strokeOpacity={0.18} strokeWidth={u * 0.14}>
          {Array.from({ length: BRUSH_LINES - 1 }, (_, index) => {
            const ly = sheet.y + u * 3 + (index * (sheet.h - u * 4)) / (BRUSH_LINES - 1);
            const inset = ((index * 23) % 13) * u;
            return (
              <path key={index} d={`M${sheet.x + u * 2 + inset} ${ly} L${sheet.x + sheet.w - inset} ${ly}`} />
            );
          })}
        </g>
        <rect
          x={sheet.x}
          y={sheet.y}
          width={sheet.w}
          height={sheet.h}
          rx={u * 1.6}
          fill={`url(#${id}-lamp)`}
        />
        <rect
          x={sheet.x}
          y={sheet.y}
          width={sheet.w}
          height={sheet.h}
          rx={u * 1.6}
          fill="none"
          stroke={look.line}
          strokeOpacity={0.7}
          strokeWidth={u * 0.5}
        />
        <path
          d={`M${sheet.x + u * 2} ${sheet.y + u * 0.8} L${sheet.x + sheet.w - u * 2} ${sheet.y + u * 0.8}`}
          stroke="#ffffff"
          strokeOpacity={0.7}
          strokeWidth={u * 0.5}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

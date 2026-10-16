import { darken, lighten } from "../../../../../ui/art/colourMix";
import { Legs } from "./Legs";
import { INK, type Box } from "./spriteBox";

export function Desk({ w, u, fill, line }: Box) {
  const h = u * 0.9;
  return (
    <g>
      <Legs w={w} h={h * 0.88} u={u} line={line} />
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={u * 0.14}
        rx={u * 0.04}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={w / 2 - u * 0.62}
        y={-h + u * 0.14}
        width={u * 0.56}
        height={u * 0.3}
        fill={lighten(fill, 0.15)}
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      <circle cx={w / 2 - u * 0.34} cy={-h + u * 0.29} r={u * 0.035} fill={INK} />
      <rect
        x={-w / 2 + u * 0.24}
        y={-h - u * 0.22}
        width={u * 0.3}
        height={u * 0.22}
        rx={u * 0.03}
        fill="#f4ecd8"
        stroke={INK}
        strokeWidth={line * 0.6}
      />
    </g>
  );
}

export function CoffeeTable({ w, u, fill, line }: Box) {
  const h = u * 0.45;
  return (
    <g>
      <Legs w={w * 0.9} h={h} u={u} line={line} />
      <rect
        x={-w / 2}
        y={-h - u * 0.1}
        width={w}
        height={u * 0.13}
        rx={u * 0.05}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <ellipse
        cx={-w * 0.18}
        cy={-h - u * 0.14}
        rx={u * 0.12}
        ry={u * 0.04}
        fill="#f4ecd8"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <rect
        x={w * 0.05}
        y={-h - u * 0.26}
        width={u * 0.1}
        height={u * 0.14}
        rx={u * 0.03}
        fill="#f07f63"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
    </g>
  );
}

export function DiningTable({ w, u, fill, line }: Box) {
  const h = u * 0.85;
  const chair = (side: number) => (
    <g transform={`translate(${side * (w / 2 - u * 0.1)} 0)`}>
      <rect
        x={-u * 0.14}
        y={-h * 1.1}
        width={u * 0.28}
        height={h * 0.6}
        rx={u * 0.08}
        fill={lighten(fill, 0.1)}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-u * 0.2}
        y={-h * 0.52}
        width={u * 0.4}
        height={u * 0.1}
        rx={u * 0.04}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M${-u * 0.16} ${-h * 0.42} L${-u * 0.16} 0 M${u * 0.16} ${-h * 0.42} L${u * 0.16} 0`}
        stroke={INK}
        strokeWidth={line * 1.2}
      />
    </g>
  );
  return (
    <g>
      {chair(-1)}
      {chair(1)}
      <path
        d={`M0 ${-h} L0 0 M${-u * 0.3} 0 L${u * 0.3} 0`}
        stroke={INK}
        strokeWidth={line * 2.2}
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={-h} rx={w / 2 - u * 0.3} ry={u * 0.1} fill={fill} stroke={INK} strokeWidth={line} />
      <circle cx={0} cy={-h - u * 0.16} r={u * 0.09} fill="#f6d77a" stroke={INK} strokeWidth={line * 0.5} />
    </g>
  );
}

function SetChair({ x, h, u, fill, line }: { x: number; h: number; u: number; fill: string; line: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect
        x={-u * 0.15}
        y={-h * 1.15}
        width={u * 0.3}
        height={h * 0.62}
        rx={u * 0.09}
        fill={lighten(fill, 0.12)}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-u * 0.21}
        y={-h * 0.54}
        width={u * 0.42}
        height={u * 0.1}
        rx={u * 0.04}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M${-u * 0.17} ${-h * 0.44} L${-u * 0.17} 0 M${u * 0.17} ${-h * 0.44} L${u * 0.17} 0`}
        stroke={INK}
        strokeWidth={line * 1.2}
      />
    </g>
  );
}

export function DiningSet({ w, u, fill, line }: Box) {
  const h = u * 0.85;
  return (
    <g>
      <SetChair x={-w * 0.3} h={h} u={u} fill={fill} line={line} />
      <SetChair x={w * 0.3} h={h} u={u} fill={fill} line={line} />
      <rect
        x={-w / 2 + u * 0.1}
        y={-h}
        width={w - u * 0.2}
        height={u * 0.14}
        rx={u * 0.05}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <Legs w={w - u * 0.2} h={h - u * 0.1} u={u} line={line} />
      {[-0.12, 0.14].map((share) => (
        <ellipse
          key={share}
          cx={w * share}
          cy={-h - u * 0.05}
          rx={u * 0.14}
          ry={u * 0.04}
          fill="#f4ecd8"
          stroke={INK}
          strokeWidth={line * 0.5}
        />
      ))}
      <path
        d={`M0 ${-h} l${-u * 0.05} ${-u * 0.22} l${u * 0.1} 0 Z`}
        fill="#9cb59a"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <circle cx={0} cy={-h - u * 0.28} r={u * 0.08} fill="#f07f63" stroke={INK} strokeWidth={line * 0.5} />
    </g>
  );
}

export function BedsideTable({ w, u, fill, line }: Box) {
  const h = u * 0.62;
  const width = Math.min(w, u * 0.8);
  return (
    <g>
      <rect
        x={-width / 2}
        y={-h}
        width={width}
        height={h}
        rx={u * 0.06}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-width / 2 + u * 0.06}
        y={-h + u * 0.1}
        width={width - u * 0.12}
        height={h * 0.32}
        rx={u * 0.03}
        fill={lighten(fill, 0.15)}
        stroke={INK}
        strokeWidth={line * 0.6}
      />
      <circle
        cx={0}
        cy={-h + u * 0.1 + h * 0.16}
        r={u * 0.035}
        fill="#e8c46a"
        stroke={INK}
        strokeWidth={line * 0.4}
      />
      <rect
        x={-width / 2 - u * 0.03}
        y={-h - u * 0.05}
        width={width + u * 0.06}
        height={u * 0.08}
        rx={u * 0.03}
        fill={darken(fill, 0.12)}
        stroke={INK}
        strokeWidth={line * 0.7}
      />
    </g>
  );
}

export function ConsoleTable({ w, u, fill, line }: Box) {
  const h = u * 0.9;
  return (
    <g>
      <Legs w={w} h={h} u={u} line={line} />
      <rect
        x={-w / 2}
        y={-h - u * 0.04}
        width={w}
        height={u * 0.12}
        rx={u * 0.04}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 + u * 0.1}
        y={-h + u * 0.1}
        width={w - u * 0.2}
        height={u * 0.16}
        rx={u * 0.03}
        fill={lighten(fill, 0.1)}
        stroke={INK}
        strokeWidth={line * 0.6}
      />
      <path
        d={`M${w * 0.22} ${-h - u * 0.04} q${-u * 0.12} ${-u * 0.14} 0 ${-u * 0.32} q${u * 0.12} ${u * 0.18} 0 ${u * 0.32} Z`}
        fill="#2a8c91"
        stroke={INK}
        strokeWidth={line * 0.6}
      />
      <rect
        x={-w * 0.3}
        y={-h - u * 0.12}
        width={u * 0.22}
        height={u * 0.08}
        rx={u * 0.02}
        fill="#c9a227"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
    </g>
  );
}

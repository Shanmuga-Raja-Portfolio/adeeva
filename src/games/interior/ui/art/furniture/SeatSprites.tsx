import { darken, lighten } from "../../../../../ui/art/colourMix";
import { Legs } from "./Legs";
import { INK, type Box } from "./spriteBox";

export function Chair({ w, u, fill, line }: Box) {
  const h = u * 0.95;
  const seat = Math.min(w, u * 0.62);
  return (
    <g>
      <rect
        x={-seat / 2}
        y={-h}
        width={seat}
        height={h * 0.5}
        rx={u * 0.12}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-seat / 2 - u * 0.04}
        y={-h * 0.5}
        width={seat + u * 0.08}
        height={u * 0.12}
        rx={u * 0.05}
        fill={lighten(fill, 0.2)}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M0 ${-h * 0.4} L0 ${-u * 0.1} M${-seat / 2} 0 L${seat / 2} 0`}
        stroke={INK}
        strokeWidth={line * 1.4}
        strokeLinecap="round"
      />
    </g>
  );
}

export function WindowSeat({ w, u, soft, fill, line }: Box) {
  const h = u * 0.6;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={u * 0.06}
        fill="#f4ecd8"
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 + u * 0.12}
        y={-h + u * 0.2}
        width={w / 3 - u * 0.2}
        height={h - u * 0.3}
        rx={u * 0.04}
        fill={lighten(fill, 0.5)}
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <rect
        x={w / 6 + u * 0.08}
        y={-h + u * 0.2}
        width={w / 3 - u * 0.2}
        height={h - u * 0.3}
        rx={u * 0.04}
        fill={lighten(fill, 0.5)}
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <rect
        x={-w / 2 + u * 0.04}
        y={-h - u * 0.16}
        width={w - u * 0.08}
        height={u * 0.2}
        rx={u * 0.1}
        fill={soft}
        stroke={INK}
        strokeWidth={line}
      />
      <ellipse
        cx={-w * 0.28}
        cy={-h - u * 0.26}
        rx={u * 0.18}
        ry={u * 0.14}
        fill={lighten(soft, 0.3)}
        stroke={INK}
        strokeWidth={line * 0.7}
      />
    </g>
  );
}

export function BeanBag({ w, u, soft, line }: Box) {
  const r = Math.min(w, u) * 0.46;
  return (
    <g>
      <path
        d={`M${-r} 0 Q${-r * 1.1} ${-r * 1.2} ${-r * 0.2} ${-r * 1.5} Q${r * 0.5} ${-r * 1.7} ${r * 0.9} ${-r * 0.9} Q${r * 1.15} ${-r * 0.2} ${r} 0 Z`}
        fill={soft}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M${-r * 0.6} ${-r * 0.5} Q0 ${-r * 0.2} ${r * 0.6} ${-r * 0.55}`}
        fill="none"
        stroke={darken(soft, 0.22)}
        strokeWidth={line}
        strokeLinecap="round"
      />
      <ellipse
        cx={-r * 0.25}
        cy={-r * 1.15}
        rx={r * 0.3}
        ry={r * 0.14}
        fill={lighten(soft, 0.4)}
        opacity={0.8}
      />
    </g>
  );
}

export function HallBench({ w, u, fill, soft, line }: Box) {
  const h = u * 0.55;
  const panel = u * 1.7;
  return (
    <g>
      <rect
        x={-w / 2 + u * 0.06}
        y={-panel}
        width={w - u * 0.12}
        height={panel - h}
        rx={u * 0.05}
        fill={lighten(fill, 0.12)}
        stroke={INK}
        strokeWidth={line}
      />
      {[-0.3, 0, 0.3].map((share) => (
        <g key={share}>
          <circle
            cx={share * w}
            cy={-panel + u * 0.24}
            r={u * 0.05}
            fill="#c9a227"
            stroke={INK}
            strokeWidth={line * 0.5}
          />
          <path
            d={`M${share * w} ${-panel + u * 0.28} l${-u * 0.12} ${u * 0.5} l${u * 0.24} 0 Z`}
            fill={share === 0 ? soft : darken(soft, 0.15)}
            stroke={INK}
            strokeWidth={line * 0.6}
          />
        </g>
      ))}
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={u * 0.14}
        rx={u * 0.05}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 + u * 0.12}
        y={-h + u * 0.18}
        width={u * 0.3}
        height={u * 0.16}
        rx={u * 0.04}
        fill="#9c4a2f"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <rect
        x={w / 2 - u * 0.44}
        y={-h + u * 0.18}
        width={u * 0.3}
        height={u * 0.16}
        rx={u * 0.04}
        fill="#22305a"
        stroke={INK}
        strokeWidth={line * 0.5}
      />
      <Legs w={w} h={h - u * 0.14} u={u} line={line} />
    </g>
  );
}

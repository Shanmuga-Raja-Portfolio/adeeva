import { darken, lighten } from "../../../../../ui/art/colourMix";
import { Legs } from "./Legs";
import { INK, type Box } from "./spriteBox";

export function Bed({ w, u, fill, soft, line }: Box) {
  const h = u * 0.95;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={u * 0.18}
        height={h}
        rx={u * 0.06}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2}
        y={-h * 0.48}
        width={w}
        height={h * 0.32}
        rx={u * 0.08}
        fill={lighten(fill, 0.25)}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 + u * 0.2}
        y={-h * 0.66}
        width={u * 0.42}
        height={h * 0.2}
        rx={u * 0.1}
        fill="#fffaf2"
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      <path
        d={`M${-w / 2 + u * 0.5} ${-h * 0.5} Q${0} ${-h * 0.62} ${w / 2 - u * 0.04} ${-h * 0.5} L${w / 2 - u * 0.04} ${-h * 0.18} L${-w / 2 + u * 0.5} ${-h * 0.18} Z`}
        fill={soft}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M${-w / 2 + u * 0.7} ${-h * 0.4} L${w / 2 - u * 0.2} ${-h * 0.4}`}
        stroke={lighten(soft, 0.4)}
        strokeWidth={line * 1.4}
        strokeLinecap="round"
      />
      <Legs w={w} h={h * 0.16} u={u} line={line} />
    </g>
  );
}

export function Bunk({ w, u, fill, soft, line }: Box) {
  const h = u * 2.3;
  const post = u * 0.12;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={post}
        height={h}
        rx={post / 3}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={w / 2 - post}
        y={-h}
        width={post}
        height={h}
        rx={post / 3}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      {[0.32, 0.86].map((level) => (
        <g key={level}>
          <rect
            x={-w / 2 + post}
            y={-h * level}
            width={w - 2 * post}
            height={u * 0.22}
            fill={lighten(fill, 0.2)}
            stroke={INK}
            strokeWidth={line}
          />
          <rect
            x={-w / 2 + post}
            y={-h * level - u * 0.2}
            width={w - 2 * post}
            height={u * 0.22}
            rx={u * 0.08}
            fill={soft}
            stroke={INK}
            strokeWidth={line * 0.8}
          />
        </g>
      ))}
      <rect
        x={-w / 2 + post}
        y={-h * 0.99}
        width={w - 2 * post}
        height={u * 0.1}
        fill={fill}
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      <g stroke={darken(fill, 0.25)} strokeWidth={line * 1.3} strokeLinecap="round">
        <path
          d={`M${w / 2 - u * 0.5} ${-h * 0.1} L${w / 2 - u * 0.5} ${-h * 0.8} M${w / 2 - u * 0.2} ${-h * 0.1} L${w / 2 - u * 0.2} ${-h * 0.8}`}
        />
        {[0.25, 0.42, 0.59, 0.76].map((rung) => (
          <path key={rung} d={`M${w / 2 - u * 0.5} ${-h * rung} L${w / 2 - u * 0.2} ${-h * rung}`} />
        ))}
      </g>
    </g>
  );
}

export function DoubleBed({ w, u, fill, soft, line }: Box) {
  const h = u * 1.05;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h * 1.15}
        width={u * 0.2}
        height={h * 1.15}
        rx={u * 0.08}
        fill={darken(fill, 0.08)}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2}
        y={-h * 0.5}
        width={w}
        height={h * 0.34}
        rx={u * 0.08}
        fill={lighten(fill, 0.25)}
        stroke={INK}
        strokeWidth={line}
      />
      {[0.22, 0.62].map((left) => (
        <rect
          key={left}
          x={-w / 2 + u * left}
          y={-h * 0.72}
          width={u * 0.36}
          height={h * 0.2}
          rx={u * 0.1}
          fill="#fffaf2"
          stroke={INK}
          strokeWidth={line * 0.8}
        />
      ))}
      <path
        d={`M${-w / 2 + u * 1.02} ${-h * 0.52} Q${u * 0.1} ${-h * 0.66} ${w / 2 - u * 0.04} ${-h * 0.52} L${w / 2 - u * 0.04} ${-h * 0.18} L${-w / 2 + u * 1.02} ${-h * 0.18} Z`}
        fill={soft}
        stroke={INK}
        strokeWidth={line}
      />
      {[0.25, 0.5, 0.75].map((share) => (
        <circle
          key={share}
          cx={-w / 2 + u * 1.02 + (w - u * 1.06) * share}
          cy={-h * 0.36}
          r={u * 0.04}
          fill={lighten(soft, 0.45)}
        />
      ))}
      <Legs w={w} h={h * 0.16} u={u} line={line} />
    </g>
  );
}

export function Daybed({ w, u, fill, soft, line }: Box) {
  const h = u * 0.8;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h * 1.25}
        width={w}
        height={h * 0.5}
        rx={u * 0.14}
        fill={darken(soft, 0.06)}
        stroke={INK}
        strokeWidth={line}
      />
      {Array.from({ length: 5 }, (_, index) => (
        <path
          key={index}
          d={`M${-w / 2 + (w * (index + 1)) / 6} ${-h * 1.2} L${-w / 2 + (w * (index + 1)) / 6} ${-h * 0.8}`}
          stroke={darken(soft, 0.2)}
          strokeWidth={line * 0.8}
        />
      ))}
      <rect
        x={-w / 2}
        y={-h * 0.78}
        width={w}
        height={h * 0.42}
        rx={u * 0.12}
        fill={soft}
        stroke={INK}
        strokeWidth={line}
      />
      <ellipse
        cx={-w * 0.3}
        cy={-h * 0.86}
        rx={u * 0.22}
        ry={u * 0.15}
        fill={lighten(soft, 0.35)}
        stroke={INK}
        strokeWidth={line * 0.7}
      />
      <ellipse
        cx={w * 0.28}
        cy={-h * 0.86}
        rx={u * 0.2}
        ry={u * 0.14}
        fill="#fffaf2"
        stroke={INK}
        strokeWidth={line * 0.7}
      />
      <rect
        x={-w / 2 + u * 0.06}
        y={-h * 0.36}
        width={w - u * 0.12}
        height={u * 0.12}
        rx={u * 0.04}
        fill={fill}
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      <Legs w={w} h={h * 0.26} u={u} line={line} />
    </g>
  );
}

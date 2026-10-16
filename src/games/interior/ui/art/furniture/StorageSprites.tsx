import { darken, lighten } from "../../../../../ui/art/colourMix";
import { INK, type Box } from "./spriteBox";

const SPINES = ["#d0587e", "#2a8c91", "#d9a42b", "#22305a", "#9cb59a", "#f07f63", "#b9a7dc"];

export function Wardrobe({ w, u, fill, line }: Box) {
  const h = u * 2.2;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={u * 0.08}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 - u * 0.04}
        y={-h - u * 0.08}
        width={w + u * 0.08}
        height={u * 0.14}
        rx={u * 0.04}
        fill={darken(fill, 0.12)}
        stroke={INK}
        strokeWidth={line}
      />
      <path d={`M0 ${-h + u * 0.12} L0 ${-u * 0.12}`} stroke={INK} strokeWidth={line} />
      <rect
        x={-w / 2 + u * 0.14}
        y={-h + u * 0.2}
        width={w / 2 - u * 0.24}
        height={h - u * 0.5}
        rx={u * 0.06}
        fill={lighten(fill, 0.12)}
        stroke={darken(fill, 0.25)}
        strokeWidth={line * 0.6}
      />
      <rect
        x={u * 0.1}
        y={-h + u * 0.2}
        width={w / 2 - u * 0.24}
        height={h - u * 0.5}
        rx={u * 0.06}
        fill={lighten(fill, 0.12)}
        stroke={darken(fill, 0.25)}
        strokeWidth={line * 0.6}
      />
      <circle cx={-u * 0.1} cy={-h * 0.5} r={u * 0.04} fill="#e8c46a" stroke={INK} strokeWidth={line * 0.5} />
      <circle cx={u * 0.1} cy={-h * 0.5} r={u * 0.04} fill="#e8c46a" stroke={INK} strokeWidth={line * 0.5} />
    </g>
  );
}

export function Bookcase({ w, u, fill, line }: Box) {
  const h = u * 2.1;
  const shelves = [0.25, 0.5, 0.75];
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={u * 0.06}
        fill={darken(fill, 0.25)}
        stroke={INK}
        strokeWidth={line}
      />
      <rect
        x={-w / 2 + u * 0.08}
        y={-h + u * 0.08}
        width={w - u * 0.16}
        height={h - u * 0.16}
        fill={darken(fill, 0.45)}
      />
      {shelves.map((shelf, row) => (
        <g key={shelf}>
          {Array.from({ length: Math.max(3, Math.floor(w / (u * 0.16))) - 1 }, (_, index) => {
            const width = u * (0.1 + ((index + row) % 3) * 0.02);
            const height = u * (0.32 + ((index * 3 + row) % 4) * 0.04);
            const x = -w / 2 + u * 0.12 + index * u * 0.16;
            if (x + width > w / 2 - u * 0.1) return null;
            return (
              <rect
                key={index}
                x={x}
                y={-h * (1 - shelf) - height}
                width={width}
                height={height}
                rx={u * 0.02}
                fill={SPINES[(index + row * 2) % SPINES.length]}
                stroke={INK}
                strokeWidth={line * 0.4}
              />
            );
          })}
          <rect
            x={-w / 2 + u * 0.06}
            y={-h * (1 - shelf)}
            width={w - u * 0.12}
            height={u * 0.07}
            fill={fill}
            stroke={INK}
            strokeWidth={line * 0.5}
          />
        </g>
      ))}
    </g>
  );
}

export function ChestOfDrawers({ w, u, fill, line }: Box) {
  const h = u * 1.05;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h}
        rx={u * 0.06}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect
            x={-w / 2 + u * 0.08}
            y={-h + u * 0.1 + row * h * 0.3}
            width={w - u * 0.16}
            height={h * 0.26}
            rx={u * 0.04}
            fill={lighten(fill, 0.12)}
            stroke={darken(fill, 0.3)}
            strokeWidth={line * 0.6}
          />
          <rect
            x={-u * 0.12}
            y={-h + u * 0.1 + row * h * 0.3 + h * 0.1}
            width={u * 0.24}
            height={u * 0.05}
            rx={u * 0.02}
            fill="#e8c46a"
            stroke={INK}
            strokeWidth={line * 0.4}
          />
        </g>
      ))}
      <rect
        x={-w / 2 - u * 0.03}
        y={-h - u * 0.06}
        width={w + u * 0.06}
        height={u * 0.09}
        rx={u * 0.03}
        fill={darken(fill, 0.1)}
        stroke={INK}
        strokeWidth={line * 0.7}
      />
    </g>
  );
}

export function Sideboard({ w, u, fill, line }: Box) {
  const h = u * 0.85;
  const door = (w - u * 0.16) / 3;
  return (
    <g>
      <rect
        x={-w / 2}
        y={-h}
        width={w}
        height={h * 0.88}
        rx={u * 0.06}
        fill={fill}
        stroke={INK}
        strokeWidth={line}
      />
      {[0, 1, 2].map((index) => (
        <g key={index}>
          <rect
            x={-w / 2 + u * 0.08 + index * door}
            y={-h + u * 0.1}
            width={door - u * 0.06}
            height={h * 0.62}
            rx={u * 0.04}
            fill={lighten(fill, 0.14)}
            stroke={darken(fill, 0.3)}
            strokeWidth={line * 0.6}
          />
          <circle
            cx={-w / 2 + u * 0.08 + (index + 0.5) * door}
            cy={-h * 0.55}
            r={u * 0.035}
            fill="#e8c46a"
            stroke={INK}
            strokeWidth={line * 0.4}
          />
        </g>
      ))}
      <path
        d={`M${-w / 2 + u * 0.1} ${-h * 0.12} l0 ${h * 0.12} M${w / 2 - u * 0.1} ${-h * 0.12} l0 ${h * 0.12}`}
        stroke={INK}
        strokeWidth={line * 1.4}
      />
      <path
        d={`M${w * 0.25} ${-h} q${-u * 0.1} ${-u * 0.2} 0 ${-u * 0.36} q${u * 0.1} ${u * 0.16} 0 ${u * 0.36} Z`}
        fill="#d9a42b"
        stroke={INK}
        strokeWidth={line * 0.6}
      />
    </g>
  );
}

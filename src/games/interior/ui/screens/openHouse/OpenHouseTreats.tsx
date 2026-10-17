import { darken, lighten } from "../../../../../ui/art/colourMix";
import type { Cell } from "../../../content/furniture";
import { floorPoint, type CutawayFrame } from "../../art/cutawayFrame";

interface OpenHouseTreatsProps {
  readonly frame: CutawayFrame;
  readonly table: Cell | null;
  readonly easel: Cell | null;
  readonly cloth: string;
  readonly shown: number;
}

const INK = "#3b2a33";

function TreatTable({ x, y, u, cloth }: { x: number; y: number; u: number; cloth: string }) {
  const top = y - u * 0.62;
  const line = Math.max(1, u * 0.03);
  return (
    <g>
      <ellipse cx={x} cy={y} rx={u * 0.5} ry={u * 0.14} fill="#2b2230" opacity={0.2} />
      <path
        d={`M${x - u * 0.44} ${top} L${x - u * 0.48} ${y - u * 0.04} Q${x} ${y + u * 0.1} ${x + u * 0.48} ${y - u * 0.04} L${x + u * 0.44} ${top} Z`}
        fill={cloth}
        stroke={INK}
        strokeWidth={line}
        strokeLinejoin="round"
      />
      <path
        d={`M${x - u * 0.2} ${top + u * 0.1} L${x - u * 0.22} ${y} M${x + u * 0.16} ${top + u * 0.1} L${x + u * 0.18} ${y}`}
        stroke={darken(cloth, 0.18)}
        strokeWidth={line}
      />
      <ellipse
        cx={x}
        cy={top}
        rx={u * 0.46}
        ry={u * 0.14}
        fill={lighten(cloth, 0.35)}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M${x - u * 0.3} ${top - u * 0.02} L${x - u * 0.3} ${top - u * 0.34} Q${x - u * 0.2} ${top - u * 0.38} ${x - u * 0.12} ${top - u * 0.32} L${x - u * 0.13} ${top - u * 0.02} Z`}
        fill="#fff2a8"
        stroke={INK}
        strokeWidth={line}
      />
      <rect x={x - u * 0.29} y={top - u * 0.2} width={u * 0.15} height={u * 0.17} fill="#f6d77a" />
      {[-0.02, 0.1].map((dx) => (
        <rect
          key={dx}
          x={x + dx * u}
          y={top - u * 0.16}
          width={u * 0.08}
          height={u * 0.14}
          rx={u * 0.015}
          fill="#e9f6ff"
          stroke={INK}
          strokeWidth={line * 0.8}
        />
      ))}
      <ellipse
        cx={x + u * 0.3}
        cy={top - u * 0.01}
        rx={u * 0.14}
        ry={u * 0.045}
        fill="#ffffff"
        stroke={INK}
        strokeWidth={line * 0.8}
      />
      {[-0.06, 0.06].map((dx) => (
        <g key={dx}>
          <path
            d={`M${x + (0.3 + dx) * u - u * 0.05} ${top - u * 0.03} L${x + (0.3 + dx) * u - u * 0.04} ${top - u * 0.1} L${x + (0.3 + dx) * u + u * 0.04} ${top - u * 0.1} L${x + (0.3 + dx) * u + u * 0.05} ${top - u * 0.03} Z`}
            fill="#c8914f"
          />
          <circle
            cx={x + (0.3 + dx) * u}
            cy={top - u * 0.13}
            r={u * 0.055}
            fill="#f2a0ae"
            stroke={INK}
            strokeWidth={line * 0.6}
          />
          <circle cx={x + (0.3 + dx) * u} cy={top - u * 0.19} r={u * 0.018} fill="#c8304a" />
        </g>
      ))}
    </g>
  );
}

function WelcomeEasel({ x, y, u }: { x: number; y: number; u: number }) {
  const line = Math.max(1, u * 0.03);
  const w = u * 0.62;
  const h = u * 0.5;
  const top = y - u * 1.05;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={u * 0.36} ry={u * 0.1} fill="#2b2230" opacity={0.2} />
      <path
        d={`M${x - w * 0.36} ${y} L${x - w * 0.12} ${top} M${x + w * 0.36} ${y} L${x + w * 0.12} ${top} M${x} ${y - u * 0.05} L${x} ${top + h}`}
        stroke="#8a5a30"
        strokeWidth={line * 1.6}
        strokeLinecap="round"
      />
      <rect
        x={x - w / 2}
        y={top}
        width={w}
        height={h}
        rx={u * 0.05}
        fill="#2f4a3a"
        stroke="#8a5a30"
        strokeWidth={line * 2.2}
      />
      <text
        x={x}
        y={top + h * 0.46}
        textAnchor="middle"
        fontSize={u * 0.15}
        fontWeight={800}
        fill="#fffaf2"
        className="is-strip__easel"
      >
        Welcome
      </text>
      <text x={x} y={top + h * 0.8} textAnchor="middle" fontSize={u * 0.13} fill="#f6d77a">
        ♥ home ♥
      </text>
    </g>
  );
}

export function OpenHouseTreats({ frame, table, easel, cloth, shown }: OpenHouseTreatsProps) {
  return (
    <g pointerEvents="none" opacity={shown} data-testid="open-house-treats">
      {easel === null
        ? null
        : (() => {
            const [x, y] = floorPoint(frame, easel[0] + 0.5, easel[1] + 0.6);
            return <WelcomeEasel x={x} y={y} u={frame.cell} />;
          })()}
      {table === null
        ? null
        : (() => {
            const [x, y] = floorPoint(frame, table[0] + 0.5, table[1] + 0.6);
            return <TreatTable x={x} y={y} u={frame.cell} cloth={cloth} />;
          })()}
    </g>
  );
}

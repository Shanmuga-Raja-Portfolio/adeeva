import { useSvgId } from "../../../../ui/art/useSvgId";

export interface DialScaleProps {
  readonly grams: number;
  readonly target: number;
  readonly band: number;
  readonly colour: string;
  readonly stopLine: boolean;
  readonly pouring: boolean;
  readonly unit: string;
  readonly hideZone?: boolean | undefined;
}

const CX = 150;
const CY = 220;
const R = 104;
const SWEEP = 150;

function niceMax(target: number): number {
  const raw = target * 1.6;
  const step = raw > 200 ? 50 : raw > 40 ? 10 : raw > 10 ? 5 : 1;
  return Math.ceil(raw / step) * step;
}

function angleFor(grams: number, max: number): number {
  return -SWEEP + 2 * SWEEP * Math.min(1.08, Math.max(0, grams / max));
}

function at(angle: number, radius: number): [number, number] {
  const radians = (angle * Math.PI) / 180;
  return [CX + radius * Math.sin(radians), CY - radius * Math.cos(radians)];
}

function arc(from: number, to: number, radius: number): string {
  const [x1, y1] = at(from, radius);
  const [x2, y2] = at(to, radius);
  const large = to - from > 180 ? 1 : 0;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${radius} ${radius} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export function DialScale({
  grams,
  target,
  band,
  colour,
  stopLine,
  pouring,
  unit,
  hideZone = false,
}: DialScaleProps) {
  const id = useSvgId("dial");
  const max = niceMax(target);
  const low = angleFor(target * (1 - band), max);
  const high = angleFor(target * (1 + band), max);
  const needle = angleFor(grams, max);
  const inZone = Math.abs(grams - target) <= target * band;
  const ticks = Array.from({ length: 11 }, (_, index) => index);
  const fill = Math.min(1, grams / (target * 1.6));
  const [stopX, stopY] = at(angleFor(target, max), R - 30);
  return (
    <svg
      viewBox="0 0 300 340"
      className="pa-dial"
      role="img"
      aria-label={`Scale shows ${Math.round(grams)} ${unit}. Aim for ${target} ${unit}.`}
    >
      <defs>
        <radialGradient id={`${id}-face`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#f1e6cf" />
        </radialGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7b8fd6" />
          <stop offset="1" stopColor="#3d4a90" />
        </linearGradient>
        <clipPath id={`${id}-bowl`}>
          <path d="M70 46 Q72 100 150 104 Q228 100 230 46 Z" />
        </clipPath>
      </defs>
      <rect x={52} y={110} width={196} height={222} rx={34} fill={`url(#${id}-body)`} />
      <rect x={60} y={104} width={180} height={14} rx={7} fill="#c9d0ea" />
      <path d="M70 46 Q72 100 150 104 Q228 100 230 46 Z" fill="#eef2fb" stroke="#9aa6cf" strokeWidth={2} />
      <g clipPath={`url(#${id}-bowl)`}>
        <rect x={60} y={104 - 58 * fill} width={180} height={60} fill={colour} className="pa-dial__fill" />
        <path d={`M60 ${104 - 58 * fill} q22 -6 45 0 t45 0 t45 0 t45 0`} fill={colour} opacity={0.7} />
      </g>
      <ellipse cx={150} cy={46} rx={80} ry={10} fill="none" stroke="#9aa6cf" strokeWidth={2} />
      {pouring ? (
        <g className="pa-dial__puff" fill={colour}>
          {[0, 1, 2, 3, 4].map((index) => (
            <circle key={index} cx={120 + index * 15} cy={36} r={6} />
          ))}
        </g>
      ) : null}
      <circle cx={CX} cy={CY} r={R + 8} fill="#fffaf0" stroke="#2f3a78" strokeWidth={4} />
      <circle cx={CX} cy={CY} r={R} fill={`url(#${id}-face)`} />
      {hideZone ? (
        <path
          d={arc(-SWEEP, SWEEP, R - 12)}
          stroke="#e3dccb"
          strokeWidth={20}
          fill="none"
          strokeDasharray="4 10"
        />
      ) : (
        <path
          d={arc(low, high, R - 12)}
          stroke={inZone ? "#5fa046" : "#8fc274"}
          strokeWidth={20}
          fill="none"
          className={inZone ? "pa-dial__zone pa-dial__zone--hit" : "pa-dial__zone"}
        />
      )}
      {ticks.map((index) => {
        const angle = -SWEEP + (2 * SWEEP * index) / 10;
        const [x1, y1] = at(angle, R - 2);
        const [x2, y2] = at(angle, R - (index % 5 === 0 ? 24 : 14));
        const [tx, ty] = at(angle, R - 36);
        return (
          <g key={index}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b2620" strokeWidth={index % 5 === 0 ? 3 : 1.6} />
            {index % 5 === 0 ? (
              <text x={tx} y={ty + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#3b2620">
                {(max * index) / 10}
              </text>
            ) : null}
          </g>
        );
      })}
      {stopLine ? (
        <g>
          <line
            x1={CX}
            y1={CY}
            x2={stopX}
            y2={stopY}
            stroke="#4b5aa6"
            strokeWidth={3}
            strokeDasharray="6 5"
          />
          <circle cx={stopX} cy={stopY} r={6} fill="#4b5aa6" />
        </g>
      ) : null}
      <g
        style={{ transform: `rotate(${needle}deg)`, transformOrigin: `${CX}px ${CY}px` }}
        className="pa-dial__needle"
      >
        <path d={`M${CX - 4} ${CY} L${CX} ${CY - R + 10} L${CX + 4} ${CY} Z`} fill="#d9573a" />
      </g>
      <circle cx={CX} cy={CY} r={10} fill="#3b2620" />
      <rect x={100} y={CY + 42} width={100} height={34} rx={8} fill="#2f3b33" />
      <text
        x={CX}
        y={CY + 66}
        textAnchor="middle"
        fontSize={20}
        fontWeight={700}
        fill={inZone && !hideZone ? "#b8f09a" : "#f5f1e6"}
        fontFamily="ui-monospace, monospace"
      >
        {Math.round(grams)} {unit}
      </text>
    </svg>
  );
}

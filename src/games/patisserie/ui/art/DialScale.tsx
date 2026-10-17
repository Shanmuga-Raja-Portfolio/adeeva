import { darken, lighten } from "../../../../ui/art/colourMix";
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

function labelled(index: number, targetAngle: number, showTarget: boolean): boolean {
  if (index === 0 || index === 10 || index % 2 === 1) return false;
  const angle = -SWEEP + (2 * SWEEP * index) / 10;
  return !showTarget || Math.abs(angle - targetAngle) > 24;
}

const SPECKS: readonly [number, number][] = [
  [-46, 10],
  [-24, 4],
  [-6, 12],
  [14, 6],
  [34, 12],
  [52, 8],
];

function moundPeak(fill: number): number {
  return fill <= 0 ? 100 : 104 - 58 * fill - Math.min(12, 30 * fill);
}

function Mound({
  colour,
  fill,
  id,
}: {
  readonly colour: string;
  readonly fill: number;
  readonly id: string;
}) {
  if (fill <= 0) return null;
  const top = 104 - 58 * fill;
  const peak = moundPeak(fill);
  return (
    <g clipPath={`url(#${id}-bowl)`}>
      <path d={`M60 108 V${top + 6} Q150 ${peak - 4} 240 ${top + 6} V108 Z`} fill={colour} />
      <path d={`M60 108 V${top + 6} Q150 ${peak - 4} 240 ${top + 6} V108 Z`} fill={`url(#${id}-mound)`} />
      <path
        d={`M64 ${top + 6} Q150 ${peak - 4} 236 ${top + 6}`}
        fill="none"
        stroke={darken(colour, 0.22)}
        strokeWidth={2.4}
      />
      <path
        d={`M96 ${top + 2} Q140 ${peak + 2} 170 ${peak + 4}`}
        fill="none"
        stroke={lighten(colour, 0.7)}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {SPECKS.map(([dx, dy]) => (
        <circle key={dx} cx={150 + dx} cy={top + 6 + dy} r={1.6} fill={darken(colour, 0.18)} />
      ))}
    </g>
  );
}

function PourStream({ colour, landing }: { readonly colour: string; readonly landing: number }) {
  const edge = darken(colour, 0.28);
  return (
    <g className="pa-dial__stream">
      <g transform="translate(234 -8) rotate(38)">
        <path
          d="M-26 -30 Q-30 10 -18 28 H18 Q30 10 26 -30 Z"
          fill="#e8d3ad"
          stroke="#a8875a"
          strokeWidth={2}
        />
        <rect x={-26} y={-6} width={52} height={16} fill={colour} stroke={edge} strokeWidth={1.4} />
        <path d="M-18 28 Q0 36 18 28" fill={colour} stroke="#a8875a" strokeWidth={2} />
        <path d="M-16 -24 Q-20 6 -12 22" stroke="#ffffff" strokeWidth={3} opacity={0.45} fill="none" />
      </g>
      <path
        d={`M226 24 Q182 28 160 ${landing - 30} L155 ${landing} L139 ${landing} Q158 ${landing - 40} 208 10 Z`}
        fill={colour}
        stroke={edge}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d={`M212 18 Q174 28 155 ${landing - 28}`}
        stroke={lighten(colour, 0.7)}
        strokeWidth={2}
        fill="none"
      />
      {[
        [-22, -6, 3],
        [18, -8, 2.6],
        [-12, -16, 2],
        [26, -18, 1.8],
        [-30, -12, 1.6],
        [8, -20, 2.2],
      ].map(([dx = 0, dy = 0, r = 2]) => (
        <circle
          key={`${dx}-${dy}`}
          cx={146 + dx}
          cy={landing + dy}
          r={r}
          fill={colour}
          stroke={edge}
          strokeWidth={0.8}
        />
      ))}
    </g>
  );
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
  const targetAngle = angleFor(target, max);
  const [stopX, stopY] = at(targetAngle, R - 30);
  const [labelX, labelY] = at(targetAngle, R - 42);
  const [flagX, flagY] = at(targetAngle, R + 9);
  const [flagLeftX, flagLeftY] = at(targetAngle - 6, R + 22);
  const [flagRightX, flagRightY] = at(targetAngle + 6, R + 22);
  return (
    <svg
      viewBox="0 -44 300 384"
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
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b9c4e6" />
          <stop offset="0.45" stopColor="#e4e9f7" />
          <stop offset="1" stopColor="#a9b5dc" />
        </linearGradient>
        <linearGradient id={`${id}-mound`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3b2620" stopOpacity={0.16} />
          <stop offset="0.45" stopColor="#3b2620" stopOpacity={0} />
          <stop offset="1" stopColor="#3b2620" stopOpacity={0.2} />
        </linearGradient>
        <clipPath id={`${id}-bowl`}>
          <path d="M70 46 Q72 100 150 104 Q228 100 230 46 Z" />
        </clipPath>
      </defs>
      <rect x={52} y={110} width={196} height={222} rx={34} fill={`url(#${id}-body)`} />
      <rect x={60} y={104} width={180} height={14} rx={7} fill="#c9d0ea" />
      <path
        d="M70 46 Q72 100 150 104 Q228 100 230 46 Z"
        fill={`url(#${id}-glass)`}
        stroke="#9aa6cf"
        strokeWidth={2}
      />
      <Mound colour={colour} fill={fill} id={id} />
      <path
        d="M84 56 Q88 86 118 98"
        stroke="#ffffff"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.7}
        fill="none"
      />
      <ellipse cx={150} cy={46} rx={80} ry={10} fill="none" stroke="#9aa6cf" strokeWidth={2} />
      <ellipse cx={150} cy={46} rx={80} ry={10} fill="#ffffff" opacity={0.25} />
      {pouring ? <PourStream colour={colour} landing={moundPeak(fill) + 2} /> : null}
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
            {labelled(index, targetAngle, !hideZone) ? (
              <text x={tx} y={ty + 7} textAnchor="middle" fontSize={19} fontWeight={800} fill="#4a2c20">
                {(max * index) / 10}
              </text>
            ) : null}
          </g>
        );
      })}
      {hideZone ? null : (
        <g>
          <path
            d={`M${flagX} ${flagY} L${flagLeftX} ${flagLeftY} L${flagRightX} ${flagRightY} Z`}
            fill="#5fa046"
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <text
            x={labelX}
            y={labelY + 6}
            textAnchor="middle"
            fontSize={17}
            fontWeight={800}
            fill="#3f7a2e"
            stroke="#fffdf7"
            strokeWidth={4}
            paintOrder="stroke"
          >
            {target}
          </text>
        </g>
      )}
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
      <rect
        x={78}
        y={CY + 40}
        width={144}
        height={38}
        rx={9}
        fill="#2f3b33"
        stroke="#1f2822"
        strokeWidth={2}
      />
      <text
        x={CX}
        y={CY + 66}
        textAnchor="middle"
        fontSize={20}
        fontWeight={700}
        fill={inZone && !hideZone ? "#b8f09a" : "#f5f1e6"}
        fontFamily="ui-monospace, monospace"
      >
        {Math.round(grams)}
        {hideZone ? null : (
          <tspan fill="#c9d8c0" fontSize={15}>
            {" "}
            / {target}
          </tspan>
        )}{" "}
        {unit}
      </text>
    </svg>
  );
}

import { darken, lighten } from "../../../../ui/art/colourMix";

export interface PourStreamProps {
  readonly id: string;
  readonly colour: string;
  readonly landing: number;
}

const START: readonly [number, number] = [222, -14];
const BEND: readonly [number, number] = [176, 4];
const GRAINS: readonly [number, number, number][] = [
  [0.1, -9, 2.4],
  [0.16, 11, 1.8],
  [0.22, 8, 2.2],
  [0.28, -13, 1.6],
  [0.34, -10, 2.6],
  [0.4, 14, 1.6],
  [0.45, 11, 2],
  [0.52, -15, 1.8],
  [0.56, -9, 2.4],
  [0.62, 15, 1.6],
  [0.66, 12, 2.6],
  [0.72, -14, 2],
  [0.76, -11, 2.2],
  [0.82, 16, 1.8],
  [0.86, 10, 2.4],
  [0.94, -8, 2],
];
const MOTES: readonly [number, number, number][] = [
  [-52, -30, 2],
  [48, -36, 1.6],
  [-30, -44, 1.4],
  [62, -18, 1.8],
  [-64, -12, 1.4],
  [24, -50, 1.2],
];
const SPLASH: readonly [number, number, number][] = [
  [-30, -10, 3],
  [26, -12, 2.6],
  [-16, -20, 2.2],
  [36, -22, 1.8],
  [-38, -18, 1.6],
  [10, -26, 2.4],
  [-4, -14, 2],
];

const CLOUD: readonly [number, number, number][] = [
  [-34, -8, 16],
  [30, -10, 18],
  [-12, -18, 13],
  [12, -4, 20],
  [48, -2, 11],
  [-50, -2, 10],
];

function along(t: number, landing: number): [number, number] {
  const end = [150, landing] as const;
  const x = (1 - t) ** 2 * START[0] + 2 * (1 - t) * t * BEND[0] + t * t * end[0];
  const y = (1 - t) ** 2 * START[1] + 2 * (1 - t) * t * BEND[1] + t * t * end[1];
  return [x, y];
}

export function PourStream({ id, colour, landing }: PourStreamProps) {
  const edge = darken(colour, 0.42);
  const glow = lighten(colour, 0.75);
  return (
    <g className="pa-pour" transform="matrix(-1 0 0 1 300 0)">
      <defs>
        <linearGradient id={`${id}-stream`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={darken(colour, 0.12)} />
          <stop offset="0.45" stopColor={glow} />
          <stop offset="1" stopColor={darken(colour, 0.18)} />
        </linearGradient>
        <linearGradient id={`${id}-scoop`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9aa3b8" />
          <stop offset="0.35" stopColor="#f4f6fb" />
          <stop offset="0.7" stopColor="#c9cfdc" />
          <stop offset="1" stopColor="#7d8699" />
        </linearGradient>
        <radialGradient id={`${id}-puff`}>
          <stop offset="0" stopColor={glow} stopOpacity={0.9} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse
        className="pa-pour__puff"
        cx={150}
        cy={landing - 6}
        rx={84}
        ry={30}
        fill={`url(#${id}-puff)`}
      />
      {CLOUD.map(([dx, dy, r], index) => (
        <circle
          key={`cloud-${dx}`}
          className="pa-pour__cloud"
          style={{ animationDelay: `${-index * 0.3}s` }}
          cx={150 + dx}
          cy={landing + dy}
          r={r}
          fill={glow}
          opacity={0.75}
        />
      ))}
      <path
        d={`M${START[0] - 26} ${START[1] - 6} Q${BEND[0] - 22} ${BEND[1] + 8} 124 ${landing} L176 ${landing} Q${BEND[0] + 24} ${BEND[1] - 8} ${START[0] + 26} ${START[1] + 8} Z`}
        fill={glow}
        opacity={0.4}
      />
      <path
        className="pa-pour__stream"
        d={`M${START[0] - 17} ${START[1] - 3} Q${BEND[0] - 11} ${BEND[1] + 5} 137 ${landing} L163 ${landing} Q${BEND[0] + 13} ${BEND[1] - 5} ${START[0] + 17} ${START[1] + 5} Z`}
        fill={`url(#${id}-stream)`}
        stroke={edge}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path
        className="pa-pour__shine"
        d={`M${START[0] - 2} ${START[1] + 2} Q${BEND[0] - 2} ${BEND[1] + 2} 149 ${landing - 6}`}
        stroke="#ffffff"
        strokeOpacity={0.75}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray="10 9"
        fill="none"
      />
      {GRAINS.map(([t, dx, r], index) => {
        const [x, y] = along(t, landing);
        return (
          <circle
            key={t}
            className="pa-pour__grain"
            style={{ animationDelay: `${-index * 0.07}s` }}
            cx={x + dx * 1.35}
            cy={y}
            r={r * 1.8}
            fill={colour}
            stroke={edge}
            strokeWidth={0.7}
          />
        );
      })}
      {MOTES.map(([dx, dy, r], index) => (
        <circle
          key={`mote-${dx}`}
          className="pa-pour__splash"
          style={{ animationDelay: `${-index * 0.13}s` }}
          cx={150 + dx}
          cy={landing + dy}
          r={r * 1.4}
          fill={glow}
          stroke={edge}
          strokeOpacity={0.5}
          strokeWidth={0.6}
        />
      ))}
      {SPLASH.map(([dx, dy, r], index) => (
        <circle
          key={`${dx}-${dy}`}
          className="pa-pour__splash"
          style={{ animationDelay: `${-index * 0.09}s` }}
          cx={150 + dx}
          cy={landing + dy}
          r={r * 1.4}
          fill={colour}
          stroke={edge}
          strokeWidth={0.7}
        />
      ))}
      <g transform="translate(246 -42) rotate(46)">
        <rect
          x={-6}
          y={-86}
          width={12}
          height={54}
          rx={6}
          fill="#b07e58"
          stroke="#6b4232"
          strokeWidth={1.6}
        />
        <rect x={-2} y={-80} width={3} height={42} rx={1.5} fill="#e8c7a2" opacity={0.7} />
        <path
          d="M-28 -24 Q-28 -38 0 -38 Q28 -38 28 -24 V24 H-28 Z"
          fill={`url(#${id}-scoop)`}
          stroke="#6d7588"
          strokeWidth={2}
        />
        <ellipse cx={0} cy={24} rx={28} ry={9} fill={darken(colour, 0.1)} stroke="#6d7588" strokeWidth={2} />
        <ellipse cx={-4} cy={22} rx={18} ry={5} fill={glow} opacity={0.8} />
        <path d="M-20 -26 V16" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.6} />
      </g>
    </g>
  );
}

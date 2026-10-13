import { mixHex } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { MixKind } from "../../content/mix";

export interface OvenCutawayProps {
  readonly share: number;
  readonly heat: number;
  readonly running: boolean;
  readonly turned: boolean;
  readonly kind: MixKind;
  readonly batterColour: string;
  readonly reducedMotion: boolean;
  readonly title: string;
}

const STOPS: [number, string][] = [
  [0, "#f7ebc4"],
  [0.8, "#f1d590"],
  [1, "#d9a04e"],
  [1.25, "#b06b34"],
  [1.6, "#6f4126"],
];

export function crustColour(share: number, batter: string): string {
  const raw = (() => {
    for (let index = 0; index < STOPS.length - 1; index += 1) {
      const from = STOPS[index];
      const to = STOPS[index + 1];
      if (from === undefined || to === undefined) continue;
      if (share <= to[0]) return mixHex(from[1], to[1], (share - from[0]) / (to[0] - from[0]));
    }
    return STOPS[STOPS.length - 1]?.[1] ?? "#6f4126";
  })();
  return mixHex(batter, raw, Math.min(1, share * 1.1));
}

function Bake({
  kind,
  colour,
  rise,
}: {
  readonly kind: MixKind;
  readonly colour: string;
  readonly rise: number;
}) {
  if (kind === "biscuit")
    return (
      <g>
        {[-90, -30, 30, 90].map((x) => (
          <ellipse
            key={x}
            cx={x}
            cy={-6 - 4 * rise}
            rx={24}
            ry={10 + 3 * rise}
            fill={colour}
            stroke="#8a5a3a"
            strokeOpacity={0.4}
          />
        ))}
      </g>
    );
  if (kind === "shortcrust")
    return (
      <g>
        <path d="M-110 0 L-100 -26 H100 L110 0 Z" fill={colour} stroke="#8a5a3a" strokeOpacity={0.5} />
        <path d={`M-96 -26 Q0 ${-34 - 6 * rise} 96 -26`} fill={mixHex(colour, "#ffffff", 0.15)} />
      </g>
    );
  return (
    <g>
      <rect x={-104} y={-24} width={208} height={24} rx={4} fill="#9aa3ad" />
      <path
        d={`M-100 -22 Q-100 ${-30 - 46 * rise} 0 ${-34 - 50 * rise} Q100 ${-30 - 46 * rise} 100 -22 Z`}
        fill={colour}
      />
      <path
        d={`M-60 ${-30 - 34 * rise} Q0 ${-40 - 44 * rise} 60 ${-30 - 34 * rise}`}
        stroke="#ffffff"
        strokeOpacity={0.25}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

export function OvenCutaway({
  share,
  heat,
  running,
  turned,
  kind,
  batterColour,
  reducedMotion,
  title,
}: OvenCutawayProps) {
  const id = useSvgId("oven");
  const colour = crustColour(share, batterColour);
  const rise = Math.min(1, share);
  const glow = running ? 0.25 + heat * 0.13 : 0.08;
  return (
    <svg viewBox="0 0 480 400" className="pa-oven" role="img" aria-label={title}>
      <defs>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.7" r="0.7">
          <stop offset="0" stopColor="#ffb347" stopOpacity={glow} />
          <stop offset="1" stopColor="#7a2e12" stopOpacity={glow * 0.6} />
        </radialGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf3dd" />
          <stop offset="1" stopColor="#efdcb8" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity={0.12} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect
        x={20}
        y={20}
        width={440}
        height={360}
        rx={30}
        fill={`url(#${id}-body)`}
        stroke="#4b5aa6"
        strokeWidth={6}
      />
      <rect x={20} y={20} width={440} height={56} rx={26} fill="#4b5aa6" />
      <rect x={20} y={56} width={440} height={20} fill="#4b5aa6" />
      {[0, 1, 2, 3, 4].map((index) => (
        <circle
          key={index}
          cx={300 + index * 30}
          cy={48}
          r={9}
          fill={index < heat ? "#f4a259" : "#2f3a78"}
          stroke="#fff1cf"
          strokeWidth={2}
        />
      ))}
      <text
        x={60}
        y={56}
        fontFamily='"Bookman Old Style", Georgia, serif'
        fontSize={22}
        fill="#fff1cf"
        fontWeight={700}
      >
        Old Honest
      </text>
      <rect x={60} y={100} width={360} height={230} rx={22} fill="#3b2620" />
      <rect x={70} y={110} width={340} height={210} rx={16} fill={`url(#${id}-glow)`} />
      <path
        d="M86 140 H394 M86 290 H394"
        stroke="#e35d2b"
        strokeWidth={4}
        strokeOpacity={running ? 0.8 : 0.25}
        strokeDasharray="10 8"
      />
      <g
        transform={`translate(240 ${262}) scale(${turned ? -1 : 1} 1)`}
        className={reducedMotion ? undefined : "pa-oven__tray"}
      >
        <rect x={-120} y={0} width={240} height={10} rx={3} fill="#b9c0c9" />
        {reducedMotion ? (
          <Bake kind={kind} colour={colour} rise={1} />
        ) : (
          <Bake kind={kind} colour={colour} rise={rise} />
        )}
        <circle cx={-110} cy={5} r={3} fill="#7d858f" />
      </g>
      <rect x={70} y={110} width={340} height={210} rx={16} fill={`url(#${id}-glass)`} />
      <rect x={140} y={340} width={200} height={16} rx={8} fill="#c9a227" />
      {reducedMotion ? (
        <g>
          <rect x={90} y={300} width={300} height={12} rx={6} fill="#fffaf0" opacity={0.8} />
          <rect x={90} y={300} width={Math.min(300, 200 * share)} height={12} rx={6} fill={colour} />
          <line x1={290} y1={296} x2={290} y2={316} stroke="#fff1cf" strokeWidth={3} />
        </g>
      ) : null}
    </svg>
  );
}

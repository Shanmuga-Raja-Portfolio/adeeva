import { useSvgId } from "../../../../ui/art/useSvgId";

export interface TeaPourSceneProps {
  readonly ml: number;
  readonly target: number;
  readonly capacity: number;
  readonly band: number;
  readonly tea: string;
  readonly pouring: boolean;
  readonly showBand: boolean;
}

const CUP_TOP = 196;
const CUP_BOTTOM = 300;
const CUP_LEFT = 118;
const CUP_RIGHT = 262;

function levelY(ml: number, capacity: number): number {
  const share = Math.max(0, Math.min(1, ml / capacity));
  return CUP_BOTTOM - (CUP_BOTTOM - CUP_TOP - 8) * share;
}

export function TeaPourScene({ ml, target, capacity, band, tea, pouring, showBand }: TeaPourSceneProps) {
  const id = useSvgId("tea");
  const level = levelY(ml, capacity);
  const line = levelY(target, capacity);
  const low = levelY(target * (1 - band), capacity);
  const high = levelY(target * (1 + band), capacity);
  const onLine = Math.abs(ml - target) <= target * band;
  return (
    <svg
      viewBox="0 0 380 340"
      className="pa-tea-scene"
      role="img"
      aria-label={`The cup holds ${Math.round(ml)} ml. The line is at ${target} ml.`}
    >
      <defs>
        <clipPath id={`${id}-cup`}>
          <path
            d={`M${CUP_LEFT} ${CUP_TOP} L${CUP_LEFT + 10} ${CUP_BOTTOM} Q190 ${CUP_BOTTOM + 14} ${CUP_RIGHT - 10} ${CUP_BOTTOM} L${CUP_RIGHT} ${CUP_TOP} Z`}
          />
        </clipPath>
        <linearGradient id={`${id}-pot`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dde4f6" />
        </linearGradient>
      </defs>
      <ellipse cx={190} cy={318} rx={120} ry={12} fill="#3b2620" opacity={0.12} />
      <ellipse cx={190} cy={310} rx={104} ry={14} fill="#ffffff" stroke="#c9d0ea" strokeWidth={2} />
      <path
        d={`M${CUP_RIGHT - 4} 218 C${CUP_RIGHT + 46} 214 ${CUP_RIGHT + 44} 280 ${CUP_RIGHT - 14} 272`}
        fill="none"
        stroke="#9aa6cf"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d={`M${CUP_LEFT} ${CUP_TOP} L${CUP_LEFT + 10} ${CUP_BOTTOM} Q190 ${CUP_BOTTOM + 14} ${CUP_RIGHT - 10} ${CUP_BOTTOM} L${CUP_RIGHT} ${CUP_TOP} Z`}
        fill="#ffffff"
        stroke="#9aa6cf"
        strokeWidth={3}
      />
      <g clipPath={`url(#${id}-cup)`} opacity={ml > 0 ? 1 : 0}>
        <rect
          x={CUP_LEFT}
          y={level}
          width={CUP_RIGHT - CUP_LEFT}
          height={CUP_BOTTOM - level + 20}
          fill={tea}
        />
        <path
          d={`M${CUP_LEFT} ${level} q18 -5 36 0 t36 0 t36 0 t36 0`}
          fill={tea}
          className={pouring ? "pa-tea-scene__ripple" : undefined}
        />
        {showBand ? (
          <rect
            x={CUP_LEFT}
            y={high}
            width={CUP_RIGHT - CUP_LEFT}
            height={Math.max(2, low - high)}
            fill={onLine ? "#5fa046" : "#8fc274"}
            opacity={0.32}
          />
        ) : null}
      </g>
      <line
        x1={CUP_LEFT + 4}
        y1={line}
        x2={CUP_RIGHT - 4}
        y2={line}
        stroke="#4b5aa6"
        strokeWidth={3}
        strokeDasharray="8 6"
      />
      <text x={CUP_LEFT - 10} y={line + 5} textAnchor="end" fontSize={14} fontWeight={700} fill="#4b5aa6">
        {target} ml
      </text>
      <ellipse cx={190} cy={CUP_TOP} rx={72} ry={10} fill="none" stroke="#9aa6cf" strokeWidth={3} />
      <path
        d={`M${CUP_LEFT + 20} 214 Q190 230 ${CUP_RIGHT - 30} 214`}
        stroke="#f2c4c9"
        strokeWidth={6}
        fill="none"
      />
      <g
        className="pa-tea-scene__pot"
        style={{ transform: `rotate(${pouring ? -28 : -6}deg)`, transformOrigin: "300px 120px" }}
      >
        <path d="M196 92 Q160 60 136 92 L168 104 Z" fill="#c9d0ea" stroke="#7b8fd6" strokeWidth={2} />
        <path
          d="M210 70 Q206 150 270 154 Q336 150 332 70 Q300 46 270 46 Q240 46 210 70 Z"
          fill={`url(#${id}-pot)`}
          stroke="#7b8fd6"
          strokeWidth={3}
        />
        <path
          d="M332 82 Q372 84 360 120 Q350 140 330 128"
          fill="none"
          stroke="#7b8fd6"
          strokeWidth={9}
          strokeLinecap="round"
        />
        <path
          d="M212 96 Q170 96 146 82"
          fill="none"
          stroke="#7b8fd6"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <ellipse cx={271} cy={50} rx={36} ry={8} fill="#e3e6f6" stroke="#7b8fd6" strokeWidth={2} />
        <circle cx={271} cy={38} r={7} fill="#f4a259" stroke="#c86a24" strokeWidth={2} />
        <path
          d="M236 100 Q270 118 306 100"
          stroke="#f2c4c9"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={250} cy={86} r={4} fill="#f2c4c9" />
        <circle cx={292} cy={86} r={4} fill="#f2c4c9" />
      </g>
      {pouring ? (
        <path
          d={`M146 158 Q152 ${Math.max(level - 20, 170)} 172 ${Math.max(level - 2, 176)}`}
          stroke={tea}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
          className="pa-tea-scene__stream"
        />
      ) : null}
    </svg>
  );
}

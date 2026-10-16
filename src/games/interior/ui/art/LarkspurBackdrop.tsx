import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { LoftDecorId } from "../../content/loftDecor";
import { PLOTS } from "../../content/plot";
import type { TourTimeId } from "../../content/tourTime";
import { keyById, type KeyWall } from "../../core";

interface LarkspurBackdropProps {
  readonly className?: string | undefined;
  readonly time?: TourTimeId | undefined;
  readonly plot?: number | null | undefined;
  readonly keyWall?: KeyWall | undefined;
  readonly decor?: readonly LoftDecorId[] | undefined;
  readonly openSign?: boolean | undefined;
}

const INK = "#3b2a33";

const SKIES: Readonly<Record<TourTimeId, readonly [string, string, string]>> = {
  morning: ["#8fc4ea", "#e6f4fb", "#fff6d6"],
  afternoon: ["#f2b46a", "#fbe3b0", "#ffe39c"],
  evening: ["#2c3566", "#b9789a", "#ffc98a"],
};

const WALLS = ["#f4dccf", "#e9c7b8", "#f6e7c4", "#dce8d3", "#e3dbef", "#f2d2c4"] as const;

function House({
  index,
  door,
  lit,
  current,
  evening,
  metal,
}: {
  index: number;
  door: string;
  lit: boolean;
  current: boolean;
  evening: boolean;
  metal: string | null;
}) {
  const x = 330 + index * 140;
  const wall = WALLS[index % WALLS.length] ?? "#f4dccf";
  const tall = index % 2 === 0;
  const top = tall ? 236 : 262;
  const glass = lit || evening ? "#ffe39c" : "#bfe3f6";
  return (
    <g>
      {current ? <ellipse cx={x + 60} cy={top + 100} rx={92} ry={120} fill="#fff4c2" opacity={0.55} /> : null}
      <rect x={x} y={top} width={120} height={430 - top} fill={wall} stroke={INK} strokeWidth={3} />
      <path
        d={`M${x - 14} ${top + 4} L${x + 60} ${top - 70} L${x + 134} ${top + 4} Z`}
        fill={darken(door, 0.2)}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <rect
        x={x + 82}
        y={top - 52}
        width={16}
        height={34}
        fill={darken(wall, 0.3)}
        stroke={INK}
        strokeWidth={2}
      />
      {[0, 1].map((column) => (
        <g key={column}>
          <rect
            x={x + 14 + column * 56}
            y={top + 22}
            width={36}
            height={40}
            rx={4}
            fill={glass}
            stroke={INK}
            strokeWidth={2.5}
          />
          <path
            d={`M${x + 32 + column * 56} ${top + 22} L${x + 32 + column * 56} ${top + 62} M${x + 14 + column * 56} ${top + 42} L${x + 50 + column * 56} ${top + 42}`}
            stroke="#fffaf2"
            strokeWidth={2}
          />
        </g>
      ))}
      <rect x={x + 42} y={364} width={36} height={66} rx={14} fill={door} stroke={INK} strokeWidth={3} />
      <circle cx={x + 70} cy={398} r={3} fill="#f6d77a" />
      <circle
        cx={x + 60}
        cy={354}
        r={lit ? 9 : 5}
        fill={lit ? "#ffe27a" : "#d9cbb8"}
        opacity={lit ? 1 : 0.8}
      />
      {lit ? <circle cx={x + 60} cy={354} r={26} fill="#fff1b8" opacity={0.45} /> : null}
      <rect x={x + 18} y={376} width={18} height={14} rx={3} fill="#fffaf2" stroke={INK} strokeWidth={1.5} />
      <text
        x={x + 27}
        y={387}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={INK}
        fontFamily="Futura, 'Century Gothic', sans-serif"
      >
        {index + 1}
      </text>
      <path
        d={`M${x + 4} 430 Q${x + 24} 414 ${x + 40} 430 M${x + 80} 430 Q${x + 98} 412 ${x + 116} 430`}
        fill="#7d8a4a"
        stroke={darken("#7d8a4a", 0.3)}
        strokeWidth={2}
      />
      {metal !== null ? (
        <g transform={`translate(${x + 96} ${top + 80}) rotate(-12)`}>
          <circle r={7} fill="none" stroke={metal} strokeWidth={3} />
          <rect x={5} y={-2} width={16} height={4} rx={2} fill={metal} />
        </g>
      ) : null}
    </g>
  );
}

function Cabin({ decor, openSign }: { decor: readonly LoftDecorId[]; openSign: boolean }) {
  return (
    <g>
      <rect x={60} y={312} width={210} height={120} rx={6} fill="#c8914f" stroke={INK} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((row) => (
        <path
          key={row}
          d={`M60 ${332 + row * 20} L270 ${332 + row * 20}`}
          stroke={darken("#c8914f", 0.25)}
          strokeWidth={2}
        />
      ))}
      <path
        d="M48 316 L165 262 L282 316 Z"
        fill="#7d8a4a"
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <rect x={90} y={350} width={54} height={44} rx={4} fill="#fff4c2" stroke={INK} strokeWidth={3} />
      <rect x={178} y={354} width={42} height={78} rx={6} fill="#3c6aa8" stroke={INK} strokeWidth={3} />
      <g transform="translate(165 292)">
        <rect
          x={-74}
          y={-18}
          width={148}
          height={30}
          rx={8}
          fill={openSign ? "#9b1b30" : "#fffaf2"}
          stroke={INK}
          strokeWidth={2.5}
        />
        <text
          x={0}
          y={3}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill={openSign ? "#fff4c2" : INK}
          fontFamily="Futura, 'Century Gothic', sans-serif"
        >
          {openSign ? "Open House" : "Bellwind Homes"}
        </text>
      </g>
      {decor.includes("cabin-bunting") ? (
        <g>
          <path d="M40 300 Q165 340 290 300" fill="none" stroke="#5b4f60" strokeWidth={2} />
          {Array.from({ length: 9 }, (_, index) => {
            const x = 56 + index * 28;
            const y = 304 + Math.sin((index / 8) * Math.PI) * 18;
            return (
              <path
                key={index}
                d={`M${x - 8} ${y} L${x + 8} ${y} L${x} ${y + 16} Z`}
                fill={["#f07f63", "#f6d77a", "#9fd0ee", "#9cb59a", "#b9a7dc"][index % 5]}
                stroke={INK}
                strokeWidth={1.2}
              />
            );
          })}
        </g>
      ) : null}
      {decor.includes("street-map") ? (
        <g transform="translate(96 404)">
          <rect x={0} y={0} width={40} height={24} rx={2} fill="#f2d79a" stroke={INK} strokeWidth={2} />
          <path d="M4 18 Q14 6 22 14 T36 6" fill="none" stroke="#c8664a" strokeWidth={2} />
        </g>
      ) : null}
      {decor.includes("key-hooks") ? (
        <g transform="translate(232 330)">
          {[0, 1, 2].map((index) => (
            <circle key={index} cx={index * 10} cy={0} r={3} fill="#c9a227" stroke={INK} strokeWidth={1} />
          ))}
        </g>
      ) : null}
    </g>
  );
}

export function LarkspurBackdrop({
  className,
  time = "morning",
  plot = null,
  keyWall,
  decor = [],
  openSign = false,
}: LarkspurBackdropProps) {
  const id = useSvgId("is-close");
  const [top, middle, glow] = SKIES[time];
  const evening = time === "evening";
  return (
    <svg
      className={className}
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.7" stopColor={middle} />
          <stop offset="1" stopColor={glow} />
        </linearGradient>
        <linearGradient id={`${id}-road`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9c2bb" />
          <stop offset="1" stopColor="#a89f99" />
        </linearGradient>
      </defs>
      <rect width={1200} height={600} fill={`url(#${id}-sky)`} />
      {evening ? (
        <g fill="#fff4c2">
          {[120, 300, 520, 760, 980, 1110].map((x, index) => (
            <circle key={x} cx={x} cy={50 + (index % 3) * 34} r={2.5} opacity={0.8} />
          ))}
          <circle cx={1060} cy={96} r={30} fill="#fff4dc" />
        </g>
      ) : (
        <g>
          <circle cx={1060} cy={110} r={46} fill={time === "morning" ? "#fff4c2" : "#ffd27a"} />
          <g fill="#ffffff" opacity={0.85}>
            <ellipse cx={240} cy={110} rx={70} ry={22} />
            <ellipse cx={290} cy={96} rx={46} ry={20} />
            <ellipse cx={760} cy={80} rx={60} ry={18} />
          </g>
        </g>
      )}
      <path d="M0 330 Q300 250 600 300 T1200 280 L1200 600 L0 600 Z" fill={evening ? "#4d5f4a" : "#9cb59a"} />
      <path
        d="M0 380 Q400 330 800 370 T1200 350 L1200 600 L0 600 Z"
        fill={evening ? "#3f5040" : "#7d8a4a"}
        opacity={0.7}
      />
      <Cabin decor={decor} openSign={openSign} />
      {PLOTS.map((entry, index) => {
        const key = keyWall?.[entry.id] ?? null;
        return (
          <House
            key={entry.id}
            index={index}
            door={entry.door}
            lit={key !== null}
            current={plot === entry.number}
            evening={evening}
            metal={key === null ? null : keyById(key).metal}
          />
        );
      })}
      <rect y={430} width={1200} height={22} fill="#e9e2d8" stroke={INK} strokeWidth={2} />
      <rect y={452} width={1200} height={148} fill={`url(#${id}-road)`} />
      <path d="M0 526 L1200 526" stroke="#fffaf2" strokeWidth={6} strokeDasharray="40 30" />
      {[300, 720, 1140].map((x) => (
        <g key={x}>
          <path d={`M${x} 452 L${x} 330`} stroke={INK} strokeWidth={5} />
          <rect
            x={x - 12}
            y={312}
            width={24}
            height={22}
            rx={4}
            fill={lighten("#3b2a33", 0.2)}
            stroke={INK}
            strokeWidth={2}
          />
          <circle cx={x} cy={322} r={evening ? 40 : 14} fill="#ffe39c" opacity={evening ? 0.5 : 0.25} />
        </g>
      ))}
    </svg>
  );
}

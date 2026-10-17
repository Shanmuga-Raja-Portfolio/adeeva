import type { AvatarLook } from "../../../../engine/avatar";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { DishId } from "../../content/dish";
import { DiningTable, type TableMood } from "./DiningTable";
import { HARBOUR, KITCHEN_HATCH, MENU_BOARD, ROTA_BOARD, SPEAKER_SEAT } from "./diningLayout";
import { HarbourWindow, type HarbourSky } from "./HarbourWindow";
import { KitchenPass } from "./KitchenPass";
import { MenuChalkboard } from "./MenuChalkboard";
import { RotaBoard } from "./RotaBoard";
import { DINER_STYLES } from "./dinerWear";
import { SceneFigure } from "./SceneFigure";

export type DiningMood = "planning" | "ready" | "open" | "closed";

export interface QuaysideSceneProps {
  readonly mood: DiningMood;
  readonly menu: readonly string[];
  readonly dishes: readonly DishId[];
  readonly chef: AvatarLook;
  readonly staff: readonly AvatarLook[];
  readonly guests: readonly AvatarLook[];
  readonly note: string | null;
  readonly className?: string | undefined;
}

const FLOOR_TOP = 344;
const WAITER = { x: 878, feet: 436, scale: 0.32 } as const;

const TABLES = [
  { x: 205, y: 420, scale: 0.94 },
  { x: 584, y: 432, scale: 1.04 },
  { x: 1028, y: 420, scale: 0.94 },
] as const;

const TABLE_POSES = [
  ["talk", "cheer"],
  ["point", "talk"],
  ["wave", "talk"],
] as const;

const TABLE_FACES = [
  ["happy", "delighted"],
  ["happy", "delighted"],
  ["delighted", "thinking"],
] as const;

const PENDANT_SHIFT = [72, 0, 0] as const;

const TABLE_SIZES = [
  [1.02, 0.8],
  [1, 1.04],
  [0.84, 1],
] as const;

const TABLE_MOODS: Readonly<Record<DiningMood, readonly TableMood[]>> = {
  planning: ["set", "set", "set"],
  ready: ["set", "set", "set"],
  open: ["guests", "guests", "guests"],
  closed: ["guests", "guests", "guests"],
};

const SKY: Readonly<Record<DiningMood, HarbourSky>> = {
  planning: "day",
  ready: "dusk",
  open: "night",
  closed: "night",
};

const SIGN: Readonly<Record<DiningMood, string>> = {
  planning: "Closed today",
  ready: "Opening soon",
  open: "Open",
  closed: "Thank you!",
};

function plankEnd(x: number): number {
  return 600 + (x - 600) * 0.42;
}

function Plant({ x, y, size }: { readonly x: number; readonly y: number; readonly size: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <ellipse cx={0} cy={4} rx={44} ry={10} fill="#1a0c06" opacity={0.45} />
      {[-46, -24, -6, 12, 30, 50].map((turn, index) => (
        <path
          key={turn}
          d={`M0 -40 q${turn * 0.6} -50 ${turn} -${92 + (index % 3) * 22}`}
          stroke={index % 2 === 0 ? "#3f7a34" : "#5a9a44"}
          strokeWidth={13}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <path d="M-4 -110 q10 -14 22 -8" stroke="#8cc46a" strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d="M-30 -44 H30 L22 4 H-22 Z" fill="#b8562e" />
      <path d="M-30 -44 H-8 L-10 4 H-22 Z" fill="#ffffff" opacity={0.12} />
      <path d="M-32 -48 H32 V-38 H-32 Z" fill="#d06a3a" />
    </g>
  );
}

function Pendant({
  x,
  y,
  lit,
  cone,
  blur,
}: {
  readonly x: number;
  readonly y: number;
  readonly lit: boolean;
  readonly cone: string;
  readonly blur: string;
}) {
  return (
    <g>
      <path d={`M${x} 0 V${y - 26}`} stroke="#1d2528" strokeWidth={2.5} />
      <path
        d={`M${x - 22} ${y} L${x - 110} ${y + 400} H${x + 110} L${x + 22} ${y} Z`}
        fill={`url(#${cone})`}
        filter={`url(#${blur})`}
        opacity={lit ? 0.26 : 0.08}
      />
      <path d={`M${x - 32} ${y} Q${x} ${y - 42} ${x + 32} ${y} Z`} fill="#c47f1a" />
      <path
        d={`M${x - 14} ${y - 26} Q${x - 26} ${y - 16} ${x - 28} ${y - 4}`}
        stroke="#ffd387"
        strokeWidth={3}
        opacity={0.6}
        fill="none"
      />
      <path
        d={`M${x - 32} ${y} Q${x} ${y - 42} ${x + 32} ${y}`}
        stroke="#8a5410"
        strokeWidth={2}
        fill="none"
      />
      <ellipse cx={x} cy={y + 1} rx={26} ry={5} fill={lit ? "#fff0c4" : "#c9a77a"} />
      {lit ? <ellipse cx={x} cy={y + 6} rx={46} ry={16} fill="#ffe2a0" opacity={0.35} /> : null}
    </g>
  );
}

function StringLights({ lit }: { readonly lit: boolean }) {
  const bulbs = Array.from({ length: 25 }, (_, index) => index * 50);
  const sag = (x: number) => 46 + Math.abs(Math.sin((x / 400) * Math.PI)) * 14;
  return (
    <g>
      <path
        d={bulbs.map((x, index) => `${index === 0 ? "M" : "L"}${x} ${sag(x)}`).join(" ")}
        stroke="#2a1408"
        strokeWidth={2}
        fill="none"
      />
      {bulbs.map((x) => (
        <g key={x}>
          {lit ? <circle cx={x} cy={sag(x) + 8} r={13} fill="#ffd387" opacity={0.22} /> : null}
          <ellipse cx={x} cy={sag(x) + 7} rx={4} ry={6} fill={lit ? "#ffe7a8" : "#d8c49c"} />
        </g>
      ))}
    </g>
  );
}

function Sconce({ x, y, lit }: { readonly x: number; readonly y: number; readonly lit: boolean }) {
  return (
    <g>
      {lit ? <ellipse cx={x} cy={y - 10} rx={46} ry={60} fill="#ffd387" opacity={0.16} /> : null}
      <path d={`M${x - 10} ${y} h20 l-4 12 h-12 Z`} fill="#8a5410" />
      <path d={`M${x - 14} ${y} Q${x} ${y - 30} ${x + 14} ${y} Z`} fill={lit ? "#ffe7b0" : "#e4cfa6"} />
    </g>
  );
}

export function QuaysideScene({
  mood,
  menu,
  dishes,
  chef,
  staff,
  guests,
  note,
  className,
}: QuaysideSceneProps) {
  const id = useSvgId("ck-quay");
  const lit = mood !== "planning";
  const moods = TABLE_MOODS[mood];
  const helper =
    staff.find((look) => look.skinTone !== chef.skinTone && look.hairStyle !== chef.hairStyle) ?? staff[0];
  const speakerTable = TABLES[Math.floor(SPEAKER_SEAT / 2)] ?? TABLES[1];
  const speakerX = speakerTable.x + (SPEAKER_SEAT % 2 === 1 ? 94 : -94) * speakerTable.scale;
  return (
    <svg
      viewBox="0 0 1200 610"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-wall`} cx="0.5" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#e3a46a" />
          <stop offset="0.5" stopColor="#b8714a" />
          <stop offset="1" stopColor="#7a412c" />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5e3420" />
          <stop offset="0.45" stopColor="#94603a" />
          <stop offset="1" stopColor="#bd8450" />
        </linearGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd88a" stopOpacity={0.6} />
          <stop offset="1" stopColor="#ffd88a" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1a0c06" stopOpacity={0.6} />
          <stop offset="0.6" stopColor="#1a0c06" stopOpacity={0.28} />
          <stop offset="1" stopColor="#1a0c06" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-cone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd88a" stopOpacity={0.7} />
          <stop offset="0.6" stopColor="#f2a93b" stopOpacity={0.12} />
          <stop offset="1" stopColor="#f2a93b" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.42" r="0.78">
          <stop offset="0.66" stopColor="#1a0c06" stopOpacity={0} />
          <stop offset="1" stopColor="#1a0c06" stopOpacity={0.4} />
        </radialGradient>
        <linearGradient id={`${id}-wainscot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a4630" />
          <stop offset="1" stopColor="#4e2a1a" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-30%" y="-10%" width="160%" height="120%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.16  0 0 0 0 0.08  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}-plaster`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={3} seed={9} />
          <feColorMatrix values="0 0 0 0 0.98  0 0 0 0 0.86  0 0 0 0 0.66  0 0 0 0.22 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect width={1200} height={FLOOR_TOP} fill={`url(#${id}-wall)`} />
      <rect width={1200} height={FLOOR_TOP} fill="#ffffff" filter={`url(#${id}-plaster)`} />
      <rect width={1200} height={FLOOR_TOP} fill="#000000" filter={`url(#${id}-grain)`} opacity={0.55} />
      <rect width={1200} height={40} fill="#3a1d10" />
      {[150, 450, 750, 1050].map((x) => (
        <rect key={x} x={x - 12} y={0} width={24} height={46} fill="#2a140a" />
      ))}
      <rect y={40} width={1200} height={6} fill="#2a140a" opacity={0.6} />
      <rect y={262} width={1200} height={FLOOR_TOP - 262} fill={`url(#${id}-wainscot)`} />
      {Array.from({ length: 16 }, (_, index) => (
        <g key={`panel-${index}`}>
          <rect x={index * 80 + 8} y={274} width={64} height={60} rx={4} fill="#5e3220" />
          <path d={`M${index * 80 + 10} 276 h60`} stroke="#c07a50" strokeWidth={2} opacity={0.5} />
        </g>
      ))}
      <rect y={256} width={1200} height={10} fill="#4a2516" />
      <rect y={256} width={1200} height={3} fill="#c07a50" opacity={0.5} />
      <Sconce x={896} y={250} lit={lit} />
      <MenuChalkboard x={MENU_BOARD.x} y={MENU_BOARD.y} width={MENU_BOARD.width} menu={menu} lit={lit} />
      <HarbourWindow
        {...HARBOUR}
        sky={SKY[mood]}
        sign={SIGN[mood]}
        open={mood === "open"}
        waiting={mood === "ready" ? guests.slice(2, 5) : []}
      />
      <RotaBoard {...ROTA_BOARD} staff={staff} />
      <KitchenPass {...KITCHEN_HATCH} chef={chef} dishes={dishes} bright={lit} />
      <StringLights lit={lit} />
      <rect y={FLOOR_TOP - 6} width={1200} height={10} fill="#3a1d10" />
      <rect y={FLOOR_TOP} width={1200} height={610 - FLOOR_TOP} fill={`url(#${id}-floor)`} />
      {Array.from({ length: 19 }, (_, index) => {
        const x = -480 + index * 120;
        return (
          <path
            key={`plank-${index}`}
            d={`M${x} 610 L${plankEnd(x)} ${FLOOR_TOP}`}
            stroke="#3a1d10"
            strokeWidth={2.5}
            opacity={0.45}
          />
        );
      })}
      {[356, 378, 408, 450, 506, 572].map((y) => (
        <path key={`seam-${y}`} d={`M0 ${y} H1200`} stroke="#3a1d10" strokeWidth={2} opacity={0.22} />
      ))}
      <rect
        y={FLOOR_TOP}
        width={1200}
        height={610 - FLOOR_TOP}
        fill="#000000"
        filter={`url(#${id}-grain)`}
        opacity={0.35}
      />
      <rect y={FLOOR_TOP} width={1200} height={26} fill="#1a0c06" opacity={0.3} />
      {TABLES.map((table) => (
        <ellipse
          key={`glow-${table.x}`}
          cx={table.x}
          cy={table.y - 120}
          rx={220 * table.scale}
          ry={150 * table.scale}
          fill={`url(#${id}-pool)`}
          opacity={lit ? 0.55 : 0.2}
        />
      ))}
      {note !== null && (mood === "closed" || mood === "open") ? (
        <ellipse
          cx={speakerX}
          cy={speakerTable.y - 86}
          rx={92}
          ry={110}
          fill={`url(#${id}-pool)`}
          opacity={0.9}
        />
      ) : null}
      <Plant x={372} y={350} size={0.9} />
      <Plant x={1186} y={352} size={1} />
      {TABLES.map((table) => (
        <ellipse
          key={`pool-${table.x}`}
          cx={table.x}
          cy={table.y + 64}
          rx={260 * table.scale}
          ry={74 * table.scale}
          fill={`url(#${id}-pool)`}
          opacity={lit ? 1 : 0.4}
        />
      ))}
      {TABLES.map((table, index) => (
        <Pendant
          key={`lamp-${table.x}`}
          x={table.x + (PENDANT_SHIFT[index] ?? 0)}
          y={70}
          lit={lit}
          cone={`${id}-cone`}
          blur={`${id}-soft`}
        />
      ))}
      {helper === undefined ? null : (
        <SceneFigure
          x={WAITER.x}
          feet={WAITER.feet}
          scale={WAITER.scale}
          facing={-1}
          look={helper}
          pose={mood === "closed" ? "wave" : "present"}
          lean={2}
          mood="happy"
          className="ck-dining__staff"
        />
      )}
      {TABLES.map((table, index) => (
        <DiningTable
          key={`table-${table.x}`}
          x={table.x}
          y={table.y}
          scale={table.scale}
          shadow={`${id}-shadow`}
          mood={moods[index] ?? "set"}
          guests={guests.slice(index * 2, index * 2 + 2)}
          poses={TABLE_POSES[index] ?? ["talk", "talk"]}
          sizes={TABLE_SIZES[index] ?? [1, 1]}
          faces={TABLE_FACES[index] ?? ["happy", "happy"]}
          styles={[0, 1].flatMap((seat) => DINER_STYLES[(index * 2 + seat) % DINER_STYLES.length] ?? [])}
          dishes={[0, 1].flatMap((seat) => dishes[(index * 2 + seat + 1) % Math.max(1, dishes.length)] ?? [])}
          lit={lit && moods[index] !== "stacked"}
        />
      ))}
      <rect width={1200} height={610} fill={`url(#${id}-vignette)`} />
    </svg>
  );
}

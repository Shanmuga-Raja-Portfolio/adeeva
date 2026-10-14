import type { RunwayLightId } from "../../../adeeva/content/runwayLight";
import { RUNWAY_VIEW } from "../../../adeeva/ui/art/runwayGeometry";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface HallBackdropProps {
  readonly banner: string;
  readonly palette: readonly string[];
  readonly light: RunwayLightId;
  readonly className?: string | undefined;
  readonly title?: string | undefined;
  readonly crop?: "top" | "middle" | undefined;
}

const { width: W, height: H, horizon: HORIZON, farFeet: FAR } = RUNWAY_VIEW;
const CROWD = ["#7b7fd1", "#e57a8f", "#8fcfb2", "#f6b04e", "#9cb59a", "#b9a7dc", "#e58c78", "#6fa8c9"];

function runnerAt(y: number): { readonly left: number; readonly right: number } {
  const t = (y - FAR) / (H - FAR);
  const half = 70 + t * 290;
  return { left: W / 2 - half, right: W / 2 + half };
}

function Runner({ palette }: { readonly palette: readonly string[] }) {
  const rows = 9;
  const cols = 4;
  const ys = Array.from({ length: rows + 1 }, (_, index) => FAR + (H - FAR) * (index / rows) ** 1.35);
  return (
    <g>
      {ys.slice(0, -1).map((top, row) => {
        const bottom = ys[row + 1] ?? H;
        const a = runnerAt(top);
        const b = runnerAt(bottom);
        return Array.from({ length: cols }, (_, col) => {
          const x0 = a.left + ((a.right - a.left) * col) / cols;
          const x1 = a.left + ((a.right - a.left) * (col + 1)) / cols;
          const x2 = b.left + ((b.right - b.left) * (col + 1)) / cols;
          const x3 = b.left + ((b.right - b.left) * col) / cols;
          const colour = palette[(row + col * 3) % Math.max(1, palette.length)] ?? "#e8d9bd";
          return (
            <path
              key={`${row}-${col}`}
              d={`M${x0} ${top} L${x1} ${top} L${x2} ${bottom} L${x3} ${bottom} Z`}
              fill={colour}
              stroke="#fff4e2"
              strokeOpacity={0.55}
              strokeWidth={2}
              strokeDasharray="6 5"
            />
          );
        });
      })}
      <path
        d={`M${runnerAt(FAR).left} ${FAR} L${runnerAt(H).left} ${H} M${runnerAt(FAR).right} ${FAR} L${runnerAt(H).right} ${H}`}
        stroke="#7a5a36"
        strokeWidth={6}
        opacity={0.35}
      />
    </g>
  );
}

function FairyLights({
  y,
  sag,
  phase,
}: {
  readonly y: number;
  readonly sag: number;
  readonly phase: number;
}) {
  const bulbs = Array.from({ length: 24 }, (_, index) => index);
  return (
    <g>
      <path
        d={`M-20 ${y} Q${W / 2} ${y + sag * 2} ${W + 20} ${y}`}
        fill="none"
        stroke="#5b4a3a"
        strokeWidth={2}
      />
      {bulbs.map((index) => {
        const t = (index + 0.5) / bulbs.length;
        const x = -20 + (W + 40) * t;
        const by = y + 4 * sag * t * (1 - t) * 1 + 8;
        const warm = (index + phase) % 3;
        const fill = warm === 0 ? "#fff1a8" : warm === 1 ? "#ffd38a" : "#ffe8f0";
        return (
          <g key={index} className={index % 2 === 0 ? "tf-twinkle" : "tf-twinkle tf-twinkle--late"}>
            <circle cx={x} cy={by} r={16} fill={fill} opacity={0.22} />
            <circle cx={x} cy={by} r={6} fill={fill} />
          </g>
        );
      })}
    </g>
  );
}

function Seat({
  x,
  y,
  s,
  colour,
}: {
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly colour: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-62} r={17} fill={colour} opacity={0.95} />
      <path d="M-26 -38 Q0 -50 26 -38 L30 6 L-30 6 Z" fill={colour} opacity={0.85} />
      <rect x={-30} y={-6} width={60} height={34} rx={6} fill="#c99f72" stroke="#a07a52" strokeWidth={3} />
      <path d="M-24 28 L-30 64 M24 28 L30 64" stroke="#8a6a4a" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
}

function Crowd() {
  const rows = [
    { y: 520, s: 0.62, xs: [140, 260, 380, 520] },
    { y: 640, s: 0.8, xs: [80, 230, 380] },
    { y: 790, s: 1.02, xs: [40, 220] },
  ];
  return (
    <g>
      {rows.flatMap((row, rowIndex) =>
        row.xs.flatMap((x, index) => [
          <Seat
            key={`l-${rowIndex}-${index}`}
            x={x}
            y={row.y}
            s={row.s}
            colour={CROWD[(rowIndex * 3 + index) % CROWD.length] ?? "#7b7fd1"}
          />,
          <Seat
            key={`r-${rowIndex}-${index}`}
            x={W - x}
            y={row.y}
            s={row.s}
            colour={CROWD[(rowIndex * 5 + index + 2) % CROWD.length] ?? "#e57a8f"}
          />,
        ]),
      )}
    </g>
  );
}

export function HallBackdrop({
  banner,
  palette,
  light,
  className,
  title,
  crop = "middle",
}: HallBackdropProps) {
  const id = useSvgId("hall");
  const bannerColour = palette[0] ?? "#7b7fd1";
  const bannerEdge = palette[1] ?? "#f6d36b";
  const tint = light === "warm" ? "#ffb35c" : light === "cool" ? "#6fa8f0" : "#1b1630";
  return (
    <svg
      className={className ? `tf-hall ${className}` : "tf-hall"}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={crop === "top" ? "xMidYMin slice" : "xMidYMid slice"}
      role={title === undefined ? undefined : "img"}
      aria-label={title}
      aria-hidden={title === undefined ? true : undefined}
    >
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe0c4" />
          <stop offset="1" stopColor="#e3cfa8" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8875a" />
          <stop offset="1" stopColor="#8f6440" />
        </linearGradient>
        <linearGradient id={`${id}-night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3566" />
          <stop offset="1" stopColor="#6f5f9a" />
        </linearGradient>
        <radialGradient id={`${id}-spot`} cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#fff6dc" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff6dc" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={HORIZON + 30} fill={`url(#${id}-wall)`} />
      {[180, 470, 1030, 1320].map((x) => (
        <g key={x}>
          <path
            d={`M${x} 300 L${x} 150 Q${x + 50} 90 ${x + 100} 150 L${x + 100} 300 Z`}
            fill={`url(#${id}-night)`}
          />
          <path
            d={`M${x} 300 L${x} 150 Q${x + 50} 90 ${x + 100} 150 L${x + 100} 300 Z M${x + 50} 104 V300 M${x} 210 H${x + 100}`}
            fill="none"
            stroke="#b79a6e"
            strokeWidth={6}
          />
          <circle cx={x + 28} cy={170} r={2.5} fill="#fff" opacity={0.8} />
          <circle cx={x + 72} cy={240} r={2} fill="#fff" opacity={0.7} />
        </g>
      ))}
      <rect y={300} width={W} height={HORIZON + 30 - 300} fill="#b98a5c" />
      {Array.from({ length: 17 }, (_, index) => (
        <rect
          key={index}
          x={index * 100 + 10}
          y={312}
          width={80}
          height={96}
          rx={6}
          fill="#a87a4e"
          opacity={0.6}
        />
      ))}
      <path d={`M0 ${HORIZON + 30} L${W} ${HORIZON + 30} L${W} ${H} L0 ${H} Z`} fill={`url(#${id}-floor)`} />
      {Array.from({ length: 21 }, (_, index) => {
        const x = -400 + index * 120;
        return (
          <path
            key={index}
            d={`M${W / 2 + (x - W / 2) * 0.18} ${HORIZON + 30} L${x} ${H}`}
            stroke="#7a5233"
            strokeWidth={2}
            opacity={0.35}
          />
        );
      })}
      <rect x={W / 2 - 260} y={300} width={520} height={130} rx={8} fill="#7a5233" opacity={0.25} />
      <Runner palette={palette} />
      <g transform={`translate(${W / 2} 40)`}>
        <path
          d="M-430 0 L430 0 L430 110 Q408 132 386 110 Q364 132 342 110 L-342 110 Q-364 132 -386 110 Q-408 132 -430 110 Z"
          fill={bannerColour}
        />
        <path
          d="M-418 12 L418 12 L418 102 L-418 102 Z"
          fill="none"
          stroke={bannerEdge}
          strokeWidth={4}
          strokeDasharray="12 8"
        />
        <text
          x={0}
          y={74}
          textAnchor="middle"
          fontFamily="'Rockwell', 'Roboto Slab', Georgia, serif"
          fontSize={54}
          fontWeight={700}
          fill="#fffaf0"
          stroke="#00000022"
          strokeWidth={2}
        >
          {banner}
        </text>
        <path d="M-430 0 L-470 -40 M430 0 L470 -40" stroke="#5b4a3a" strokeWidth={3} />
      </g>
      <FairyLights y={26} sag={46} phase={0} />
      <FairyLights y={190} sag={40} phase={1} />
      <Crowd />
      <rect width={W} height={H} fill={tint} opacity={light === "spotlight" ? 0.32 : 0.1} />
      {light === "spotlight" ? <rect width={W} height={H} fill={`url(#${id}-spot)`} /> : null}
    </svg>
  );
}

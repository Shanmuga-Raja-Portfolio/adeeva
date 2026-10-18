import type { RunwayLightId } from "../../../adeeva/content/runwayLight";
import { RUNWAY_VIEW } from "../../../adeeva/ui/art/runwayGeometry";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { HallAudience } from "./HallAudience";

export interface HallBackdropProps {
  readonly banner: string;
  readonly palette: readonly string[];
  readonly light: RunwayLightId;
  readonly className?: string | undefined;
  readonly title?: string | undefined;
  readonly crop?: "top" | "middle" | undefined;
  readonly audienceId?: string | undefined;
  readonly audienceOf?: string | undefined;
}

const { width: W, height: H, horizon: HORIZON, farFeet: FAR } = RUNWAY_VIEW;

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
  const bulb = (index: number) => {
    const t = (index + 0.5) / bulbs.length;
    const x = -20 + (W + 40) * t;
    const by = y + 4 * sag * t * (1 - t) * 1 + 8;
    const warm = (index + phase) % 3;
    const fill = warm === 0 ? "#fff1a8" : warm === 1 ? "#ffd38a" : "#ffe8f0";
    return (
      <g key={index}>
        <circle cx={x} cy={by} r={16} fill={fill} opacity={0.22} />
        <circle cx={x} cy={by} r={6} fill={fill} />
      </g>
    );
  };
  return (
    <g>
      <path
        d={`M-20 ${y} Q${W / 2} ${y + sag * 2} ${W + 20} ${y}`}
        fill="none"
        stroke="#5b4a3a"
        strokeWidth={2}
      />
      <g className="tf-twinkle">{bulbs.filter((index) => index % 2 === 0).map(bulb)}</g>
      <g className="tf-twinkle tf-twinkle--late">{bulbs.filter((index) => index % 2 === 1).map(bulb)}</g>
    </g>
  );
}

function Curtain({ id, colour }: { readonly id: string; readonly colour: string }) {
  const left = W / 2 - 280;
  return (
    <g>
      <rect x={left} y={292} width={560} height={150} fill={`url(#${id}-velvet)`} />
      <rect x={left} y={292} width={560} height={150} fill={colour} opacity={0.28} />
      <path
        d={`M${left - 10} 290 H${left + 570} V316 ${Array.from({ length: 10 }, (_, index) => {
          const x = left + 570 - index * 58;
          return `Q${x - 29} 336 ${x - 58} 316`;
        }).join(" ")} Z`}
        fill={colour}
      />
      <path d={`M${left - 10} 290 H${left + 570}`} stroke="#c9a227" strokeWidth={6} />
      <path d={`M${left - 10} 318 H${left + 570}`} stroke="#c9a227" strokeWidth={2} opacity={0.7} />
      <circle cx={W / 2} cy={392} r={110} fill={`url(#${id}-spot)`} />
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
  audienceId,
  audienceOf,
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
        <pattern id={`${id}-paper`} width={60} height={60} patternUnits="userSpaceOnUse">
          <rect width={30} height={60} fill="#ffffff" opacity={0.08} />
          <path d="M45 18 l4 8 l-4 8 l-4 -8 Z" fill="#c9a77b" opacity={0.35} />
          <circle cx={15} cy={48} r={2.5} fill="#c9a77b" opacity={0.35} />
        </pattern>
        <radialGradient id={`${id}-sconce`}>
          <stop offset="0" stopColor="#fff1c9" stopOpacity={0.75} />
          <stop offset="1" stopColor="#fff1c9" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#1b1020" stopOpacity={0} />
          <stop offset="1" stopColor="#1b1020" stopOpacity={0.45} />
        </radialGradient>
        <linearGradient id={`${id}-banner`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.18} />
          <stop offset="1" stopColor="#3b1a2a" stopOpacity={0.28} />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8875a" />
          <stop offset="1" stopColor="#8f6440" />
        </linearGradient>
        <linearGradient id={`${id}-night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3566" />
          <stop offset="1" stopColor="#6f5f9a" />
        </linearGradient>
        <linearGradient
          id={`${id}-velvet`}
          x1={0}
          y1={0}
          x2={40}
          y2={0}
          gradientUnits="userSpaceOnUse"
          spreadMethod="repeat"
        >
          <stop offset="0" stopColor="#5a1f2e" />
          <stop offset="0.5" stopColor="#8a3346" />
          <stop offset="1" stopColor="#5a1f2e" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4d6" stopOpacity={0.34} />
          <stop offset="1" stopColor="#fff4d6" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff2cc" stopOpacity={0.55} />
          <stop offset="0.6" stopColor="#fff2cc" stopOpacity={0.2} />
          <stop offset="1" stopColor="#fff2cc" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-sides`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1b1020" stopOpacity={0.32} />
          <stop offset="0.3" stopColor="#1b1020" stopOpacity={0} />
          <stop offset="0.7" stopColor="#1b1020" stopOpacity={0} />
          <stop offset="1" stopColor="#1b1020" stopOpacity={0.32} />
        </linearGradient>
        <radialGradient id={`${id}-spot`} cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#fff6dc" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff6dc" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={HORIZON + 30} fill={`url(#${id}-wall)`} />
      <rect width={W} height={300} fill={`url(#${id}-paper)`} />
      <rect width={W} height={22} fill="#c9a77b" />
      <rect y={22} width={W} height={6} fill="#a07a52" />
      {[90, 350, 640, 960, 1250, 1510].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={180} rx={90} ry={120} fill={`url(#${id}-sconce)`} />
          <path d={`M${x - 10} 196 L${x + 10} 196 L${x + 6} 214 L${x - 6} 214 Z`} fill="#b8902a" />
          <path d={`M${x - 16} 170 Q${x} 150 ${x + 16} 170 L${x + 10} 196 L${x - 10} 196 Z`} fill="#fff1c9" />
        </g>
      ))}
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
      <rect y={296} width={W} height={10} fill="#d9b083" />
      <rect y={304} width={W} height={4} fill="#7a5634" opacity={0.5} />
      {Array.from({ length: 17 }, (_, index) => (
        <g key={index}>
          <rect x={index * 100 + 10} y={318} width={80} height={92} rx={6} fill="#a87a4e" />
          <rect
            x={index * 100 + 10}
            y={318}
            width={80}
            height={92}
            rx={6}
            fill="none"
            stroke="#d9b083"
            strokeWidth={3}
            opacity={0.7}
          />
          <rect
            x={index * 100 + 14}
            y={322}
            width={72}
            height={84}
            rx={4}
            fill="none"
            stroke="#6b4a2b"
            strokeWidth={2}
            opacity={0.4}
          />
        </g>
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
      <Curtain id={id} colour={bannerColour} />
      <Runner palette={palette} />
      <g transform={`translate(${W / 2} 40)`}>
        <path
          d="M-430 0 L430 0 L430 110 Q408 132 386 110 Q364 132 342 110 L-342 110 Q-364 132 -386 110 Q-408 132 -430 110 Z"
          fill={bannerColour}
        />
        <path
          d="M-430 0 L430 0 L430 110 Q408 132 386 110 Q364 132 342 110 L-342 110 Q-364 132 -386 110 Q-408 132 -430 110 Z"
          fill={`url(#${id}-banner)`}
        />
        <path
          d="M-418 12 L418 12 L418 102 L-418 102 Z"
          fill="none"
          stroke={bannerEdge}
          strokeWidth={4}
          strokeDasharray="12 8"
        />
        <rect x={-300} y={22} width={600} height={74} rx={37} fill="#4a1f33" opacity={0.88} />
        <rect
          x={-292}
          y={30}
          width={584}
          height={58}
          rx={29}
          fill="none"
          stroke="#f6d36b"
          strokeWidth={3}
          opacity={0.8}
        />
        <text
          x={0}
          y={78}
          textAnchor="middle"
          fontFamily="'Rockwell', 'Roboto Slab', Georgia, serif"
          fontSize={52}
          fontWeight={700}
          fill="#fff4d6"
          stroke="#2b0f1e"
          strokeWidth={4}
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {banner}
        </text>
        <path d="M-430 0 L-470 -40 M430 0 L470 -40" stroke="#5b4a3a" strokeWidth={3} />
      </g>
      <FairyLights y={26} sag={46} phase={0} />
      <FairyLights y={190} sag={40} phase={1} />
      {audienceOf === undefined ? (
        <g id={audienceId}>
          <HallAudience />
        </g>
      ) : (
        <use href={`#${audienceOf}`} />
      )}
      <rect width={W} height={H} fill={tint} opacity={light === "spotlight" ? 0.32 : 0.1} />
      <rect width={W} height={H} fill={`url(#${id}-sides)`} />
      <path
        d={`M${W / 2 - 70} 0 L${W / 2 + 70} 0 L${W / 2 + 330} ${H} L${W / 2 - 330} ${H} Z`}
        fill={`url(#${id}-beam)`}
      />
      <ellipse cx={W / 2} cy={H - 120} rx={340} ry={120} fill={`url(#${id}-pool)`} />
      <rect width={W} height={H} fill={`url(#${id}-vignette)`} />
      {light === "spotlight" ? <rect width={W} height={H} fill={`url(#${id}-spot)`} /> : null}
    </svg>
  );
}

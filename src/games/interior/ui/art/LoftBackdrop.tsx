import { useSvgId } from "../../../../ui/art/useSvgId";
import type { LoftDecorId } from "../../content/loftDecor";

interface LoftBackdropProps {
  readonly className?: string | undefined;
  readonly decor?: readonly LoftDecorId[] | undefined;
  readonly sign?: string | undefined;
  readonly evening?: boolean | undefined;
}

const ROOFS = [
  { dx: -10, w: 74, h: 62, c: "#c8664a" },
  { dx: 58, w: 58, h: 96, c: "#e9c7b8" },
  { dx: 112, w: 82, h: 56, c: "#7d8a4a" },
  { dx: 182, w: 60, h: 84, c: "#3c6aa8" },
] as const;

const SWATCHES = [
  "#c8664a",
  "#f6d77a",
  "#9cb59a",
  "#9fd0ee",
  "#b9a7dc",
  "#2a8c91",
  "#22305a",
  "#f2c4c9",
  "#d9a42b",
];

function ArchWindow({ x, id, evening }: { x: number; id: string; evening: boolean }) {
  return (
    <g>
      <path
        d={`M${x} 360 L${x} 170 A110 110 0 0 1 ${x + 220} 170 L${x + 220} 360 Z`}
        fill={`url(#${id}-${evening ? "dusk" : "sky"})`}
      />
      <g clipPath={`url(#${id}-arch-${x})`}>
        {ROOFS.map((roof) => (
          <g key={roof.dx}>
            <rect
              x={x + roof.dx}
              y={360 - roof.h}
              width={roof.w}
              height={roof.h}
              fill={roof.c}
              opacity={0.85}
            />
            <path
              d={`M${x + roof.dx - 6} ${360 - roof.h} L${x + roof.dx + roof.w / 2} ${330 - roof.h} L${x + roof.dx + roof.w + 6} ${360 - roof.h} Z`}
              fill="#5b4f60"
              opacity={0.7}
            />
            <rect
              x={x + roof.dx + roof.w * 0.3}
              y={360 - roof.h + 14}
              width={12}
              height={16}
              fill="#fff4c2"
              opacity={0.8}
            />
          </g>
        ))}
      </g>
      <defs>
        <clipPath id={`${id}-arch-${x}`}>
          <path d={`M${x} 360 L${x} 170 A110 110 0 0 1 ${x + 220} 170 L${x + 220} 360 Z`} />
        </clipPath>
      </defs>
      <path
        d={`M${x} 360 L${x} 170 A110 110 0 0 1 ${x + 220} 170 L${x + 220} 360 Z`}
        fill="none"
        stroke="#fffaf2"
        strokeWidth={12}
      />
      <path d={`M${x + 110} 60 L${x + 110} 360 M${x} 250 L${x + 220} 250`} stroke="#fffaf2" strokeWidth={7} />
      <rect x={x - 16} y={356} width={252} height={14} rx={6} fill="#fffaf2" />
    </g>
  );
}

export function LoftBackdrop({ className, decor = [], sign, evening = false }: LoftBackdropProps) {
  const id = useSvgId("is-loft");
  return (
    <svg
      className={className}
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={evening ? "#c9a59e" : "#f4dccf"} />
          <stop offset="1" stopColor={evening ? "#a6827f" : "#e9c7b8"} />
        </linearGradient>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fc4ea" />
          <stop offset="1" stopColor="#e6f4fb" />
        </linearGradient>
        <linearGradient id={`${id}-dusk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c3566" />
          <stop offset="1" stopColor="#d98a74" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9a873" />
          <stop offset="1" stopColor="#b97f4b" />
        </linearGradient>
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0" stopColor="#fff2b3" stopOpacity={0.9} />
          <stop offset="1" stopColor="#f6d77a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1200} height={600} fill={`url(#${id}-wall)`} />
      <path d="M0 0 L1200 0 L1200 40 L0 120 Z" fill="#fffaf2" opacity={0.55} />
      {[160, 420, 680, 940].map((x) => (
        <path
          key={x}
          d={`M${x} 0 L${x + 40} 0 L${x + 40} ${92 - x * 0.067} L${x} ${95 - x * 0.067} Z`}
          fill="#b97f4b"
          opacity={0.7}
        />
      ))}
      <ArchWindow x={180} id={id} evening={evening} />
      <ArchWindow x={800} id={id} evening={evening} />
      {evening ? null : (
        <g fill="#f6d77a" opacity={0.2}>
          <path d="M180 360 L400 360 L520 600 L250 600 Z" />
          <path d="M800 360 L1020 360 L1120 600 L860 600 Z" />
        </g>
      )}
      <rect y={440} width={1200} height={160} fill={`url(#${id}-floor)`} />
      <g stroke="#9c6a3a" strokeOpacity={0.45} strokeWidth={2}>
        <path d="M0 480 L1200 480 M0 525 L1200 525 M0 570 L1200 570" />
        <path d="M140 440 L140 480 M520 480 L520 525 M860 440 L860 480 M300 525 L300 570 M1040 525 L1040 570 M700 570 L700 600" />
      </g>
      <rect y={432} width={1200} height={12} fill="#fffaf2" opacity={0.85} />
      {decor.includes("swatch-wall") ? (
        <g transform="translate(436 196)">
          {SWATCHES.map((colour, index) => (
            <rect
              key={colour}
              x={(index % 3) * 46}
              y={Math.floor(index / 3) * 58}
              width={38}
              height={50}
              rx={4}
              fill={colour}
              stroke="#fffaf2"
              strokeWidth={4}
              transform={`rotate(${(index % 2 === 0 ? -1 : 1) * 4} ${(index % 3) * 46 + 19} ${Math.floor(index / 3) * 58 + 25})`}
            />
          ))}
        </g>
      ) : null}
      {decor.includes("neon-sign") ? (
        <g transform="translate(672 262)">
          <rect x={-96} y={-26} width={192} height={50} rx={25} fill="#2b2230" opacity={0.88} />
          <text
            x={0}
            y={7}
            textAnchor="middle"
            fontFamily="Futura, 'Century Gothic', 'Trebuchet MS', sans-serif"
            fontSize={20}
            fontWeight={700}
            fill="#ffe27a"
            style={{ filter: "drop-shadow(0 0 6px #ffcf4d)" }}
            {...((sign ?? "").length > 14 ? { textLength: 172, lengthAdjust: "spacingAndGlyphs" } : {})}
          >
            {sign ?? "Studio"}
          </text>
        </g>
      ) : null}
      <g>
        <path d="M600 0 L600 120" stroke="#3b2a33" strokeWidth={3} />
        <circle cx={600} cy={160} r={120} fill={`url(#${id}-lamp)`} opacity={evening ? 1 : 0.55} />
        <path d="M560 160 Q600 100 640 160 Z" fill="#c8664a" stroke="#3b2a33" strokeWidth={3} />
      </g>
      <g transform="translate(600 470)">
        <ellipse cx={0} cy={120} rx={330} ry={22} fill="#2b2230" opacity={0.16} />
        <rect x={-300} y={0} width={600} height={26} rx={8} fill="#8a5a30" stroke="#3b2a33" strokeWidth={3} />
        <rect x={-280} y={26} width={20} height={94} fill="#7a5236" stroke="#3b2a33" strokeWidth={3} />
        <rect x={260} y={26} width={20} height={94} fill="#7a5236" stroke="#3b2a33" strokeWidth={3} />
        <g transform="translate(-140 -6) rotate(-4)">
          <rect x={-120} y={-6} width={240} height={10} rx={2} fill="#3c6aa8" />
          <path d="M-110 -6 L-60 -6 L-60 -2 L-110 -2 Z M-40 -6 L20 -6" stroke="#ffffff" strokeWidth={1.5} />
        </g>
        <g transform="translate(150 -40)">
          <rect x={-24} y={0} width={48} height={40} rx={6} fill="#e9c7b8" stroke="#3b2a33" strokeWidth={3} />
          <ellipse cx={0} cy={0} rx={24} ry={7} fill="#9cb59a" stroke="#3b2a33" strokeWidth={3} />
          <rect x={30} y={10} width={40} height={30} rx={5} fill="#f6d77a" stroke="#3b2a33" strokeWidth={3} />
          <ellipse cx={50} cy={10} rx={20} ry={6} fill="#c8664a" stroke="#3b2a33" strokeWidth={3} />
        </g>
        <g transform="translate(-10 -20)">
          {["#c8664a", "#f6d77a", "#9cb59a", "#9fd0ee", "#b9a7dc"].map((colour, index) => (
            <rect
              key={colour}
              x={-6}
              y={-60}
              width={14}
              height={62}
              rx={4}
              fill={colour}
              stroke="#3b2a33"
              strokeWidth={2}
              transform={`rotate(${-40 + index * 16} 0 0)`}
            />
          ))}
          <circle r={5} fill="#3b2a33" />
        </g>
      </g>
      {decor.includes("loft-plant") ? (
        <g transform="translate(1090 450)">
          <path d="M-40 0 L40 0 L30 110 L-30 110 Z" fill="#c8664a" stroke="#3b2a33" strokeWidth={4} />
          <g fill="#3d9a68" stroke="#1f6b4a" strokeWidth={3}>
            <path d="M0 0 C-80 -40 -100 -120 -60 -160 C-30 -100 -10 -50 0 0 Z" />
            <path d="M0 0 C70 -40 110 -110 80 -170 C40 -110 20 -60 0 0 Z" />
            <path d="M0 0 C-20 -60 -10 -150 20 -200 C40 -140 30 -60 0 0 Z" />
          </g>
        </g>
      ) : null}
    </svg>
  );
}

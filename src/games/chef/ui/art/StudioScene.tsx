import { useSvgId } from "../../../../ui/art/useSvgId";
import type { SceneIds } from "./kitchenFixtures";

export interface StudioSceneProps {
  readonly ids: SceneIds;
  readonly books: number;
}

const SPINES = ["#d9472b", "#f2a93b", "#4f8a3c", "#3d6fb4", "#8a5ab8", "#e0708f", "#2e3a40"];

export function StudioScene({ ids, books }: StudioSceneProps) {
  const spot = useSvgId("ck-studio-spot");
  return (
    <g>
      <defs>
        <radialGradient id={spot} cx="0.5" cy="0.35" r="0.6">
          <stop offset="0" stopColor="#fff3d6" />
          <stop offset="1" stopColor="#e6dcc4" />
        </radialGradient>
      </defs>
      <rect width={1200} height={600} fill="#26323a" />
      <rect x={160} y={40} width={880} height={360} rx={12} fill={`url(#${spot})`} />
      <rect x={160} y={40} width={880} height={360} rx={12} fill="none" stroke="#1d2528" strokeWidth={6} />
      {Array.from({ length: 11 }, (_, index) => (
        <rect
          key={`tile-${index}`}
          x={190 + index * 76}
          y={200}
          width={70}
          height={36}
          rx={4}
          fill="#cfe1c9"
          stroke="#a9c3a1"
          strokeWidth={2}
        />
      ))}
      <rect x={210} y={70} width={240} height={110} rx={10} fill="#4f8a3c" />
      <text x={330} y={118} textAnchor="middle" fontSize={34} fill="#f3f0e8" className="ck-scene-label">
        Spoon &amp; Story
      </text>
      <path
        d="M262 150 q20 -16 40 0 M300 140 l52 0"
        stroke="#f2a93b"
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx={256} cy={150} rx={12} ry={8} fill="#f2a93b" />
      <rect x={780} y={70} width={220} height={130} rx={6} fill="#a3651f" />
      {[0, 1].map((row) => (
        <rect key={`shelf-${row}`} x={790} y={128 + row * 60} width={200} height={8} fill="#7a4a2a" />
      ))}
      {Array.from({ length: Math.min(12, books + 4) }, (_, index) => (
        <rect
          key={`book-${index}`}
          x={796 + (index % 8) * 24}
          y={index < 8 ? 86 : 146}
          width={20}
          height={42}
          rx={3}
          fill={SPINES[index % SPINES.length]}
        />
      ))}
      <rect x={520} y={64} width={200} height={50} rx={25} fill="#d9472b" />
      <circle cx={552} cy={89} r={10} fill="#ffe2a8" className="ck-twinkle" />
      <text x={634} y={97} textAnchor="middle" fontSize={22} fill="#fff" className="ck-scene-label">
        ON AIR
      </text>
      <rect y={400} width={1200} height={200} fill={`url(#${ids.floor})`} />
      <rect x={200} y={360} width={800} height={70} rx={10} fill="#f3f0e8" />
      <rect x={200} y={420} width={800} height={130} rx={6} fill="#4f8a3c" />
      <rect x={220} y={436} width={760} height={8} rx={4} fill="#3f7230" />
      {[300, 600, 900].map((x) => (
        <g key={`door-${x}`}>
          <rect
            x={x - 70}
            y={452}
            width={140}
            height={86}
            rx={6}
            fill="#5c9a48"
            stroke="#3f7230"
            strokeWidth={3}
          />
          <rect x={x - 20} y={466} width={40} height={6} rx={3} fill="#aeb9bf" />
        </g>
      ))}
      <ellipse cx={420} cy={362} rx={60} ry={10} fill="#aeb9bf" />
      <path d="M370 360 q50 -60 100 0 Z" fill="#2e3a40" />
      <ellipse cx={700} cy={362} rx={44} ry={8} fill="#fff" stroke="#aeb9bf" strokeWidth={3} />
      <circle cx={690} cy={356} r={10} fill="#d9472b" />
      <circle cx={712} cy={358} r={8} fill="#4f8a3c" />
      <rect
        x={820}
        y={300}
        width={90}
        height={60}
        rx={6}
        fill="#fbf7ee"
        stroke="#c47f1a"
        strokeWidth={3}
        transform="rotate(-8 865 330)"
      />
      <path
        d="M836 318 h56 M836 332 h46 M836 346 h52"
        stroke="#c47f1a"
        strokeWidth={3}
        transform="rotate(-8 865 330)"
      />
      {[60, 1140].map((x, index) => (
        <g key={`softbox-${x}`}>
          <path d={`M${x} 600 V200`} stroke="#1d2528" strokeWidth={6} />
          <rect
            x={x - 50}
            y={110}
            width={100}
            height={110}
            rx={8}
            fill="#f3f0e8"
            stroke="#1d2528"
            strokeWidth={6}
            transform={`rotate(${index === 0 ? 12 : -12} ${x} 165)`}
          />
          <path
            d={index === 0 ? `M${x + 50} 140 L420 420 L200 420 Z` : `M${x - 50} 140 L780 420 L1000 420 Z`}
            fill={`url(#${ids.lamp})`}
            opacity={0.35}
          />
        </g>
      ))}
      <g transform="translate(1030 330)">
        <rect x={-46} y={-30} width={92} height={60} rx={10} fill="#1d2528" />
        <circle cx={-46} cy={0} r={22} fill="#2e3a40" stroke="#aeb9bf" strokeWidth={4} />
        <circle cx={-46} cy={0} r={10} fill="#3d6fb4" />
        <path d="M0 30 L-30 140 M0 30 L30 140 M0 30 V140" stroke="#1d2528" strokeWidth={6} />
      </g>
    </g>
  );
}

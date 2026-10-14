import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface SceneIds {
  readonly steel: string;
  readonly steelDark: string;
  readonly sheen: string;
  readonly lamp: string;
  readonly hob: string;
  readonly floor: string;
}

export function useSceneIds(): SceneIds {
  const id = useSvgId("ck-scene");
  return {
    steel: `${id}-steel`,
    steelDark: `${id}-steel-dark`,
    sheen: `${id}-sheen`,
    lamp: `${id}-lamp`,
    hob: `${id}-hob`,
    floor: `${id}-floor`,
  };
}

export function TileWall({
  ids,
  x,
  y,
  w,
  h,
  colour,
  grout,
  size = 40,
}: {
  readonly ids: SceneIds;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly colour: string;
  readonly grout: string;
  readonly size?: number;
}) {
  const columns = Math.ceil(w / size);
  const rows = Math.ceil(h / (size / 2));
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={colour} />
      {Array.from({ length: rows }, (_, row) => (
        <path
          key={row}
          d={`M${x} ${y + row * (size / 2)} H${x + w}`}
          stroke={grout}
          strokeWidth={2}
          opacity={0.5}
        />
      ))}
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: columns }, (__, column) => {
          const offset = row % 2 === 0 ? 0 : size / 2;
          const left = x + column * size + offset;
          return left > x + w ? null : (
            <path
              key={`${row}-${column}`}
              d={`M${left} ${y + row * (size / 2)} V${y + (row + 1) * (size / 2)}`}
              stroke={grout}
              strokeWidth={2}
              opacity={0.5}
            />
          );
        }),
      )}
      <rect x={x} y={y} width={w} height={h} fill={`url(#${ids.sheen})`} opacity={0.6} />
    </g>
  );
}

export function SceneDefs({ ids }: { readonly ids: SceneIds }) {
  return (
    <defs>
      <linearGradient id={ids.steel} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dfe5e8" />
        <stop offset="0.45" stopColor="#aeb9bf" />
        <stop offset="1" stopColor="#7d8a91" />
      </linearGradient>
      <linearGradient id={ids.steelDark} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#56636a" />
        <stop offset="1" stopColor="#2e3a40" />
      </linearGradient>
      <linearGradient id={ids.sheen} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.22} />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="1" stopColor="#000000" stopOpacity={0.18} />
      </linearGradient>
      <radialGradient id={ids.lamp} cx="0.5" cy="0" r="1">
        <stop offset="0" stopColor="#ffd88a" stopOpacity={0.75} />
        <stop offset="0.5" stopColor="#f2a93b" stopOpacity={0.18} />
        <stop offset="1" stopColor="#f2a93b" stopOpacity={0} />
      </radialGradient>
      <radialGradient id={ids.hob} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffb35a" stopOpacity={0.9} />
        <stop offset="1" stopColor="#d9472b" stopOpacity={0} />
      </radialGradient>
      <linearGradient id={ids.floor} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a4038" />
        <stop offset="1" stopColor="#2a241f" />
      </linearGradient>
    </defs>
  );
}

export function Hood({ ids, x, w }: { readonly ids: SceneIds; readonly x: number; readonly w: number }) {
  return (
    <g>
      <path
        d={`M${x + w * 0.2} 40 L${x + w * 0.8} 40 L${x + w} 150 L${x} 150 Z`}
        fill={`url(#${ids.steel})`}
        stroke="#5f6c73"
        strokeWidth={3}
      />
      <rect x={x - 6} y={146} width={w + 12} height={16} rx={4} fill="#8c989e" />
      <rect
        x={x + w * 0.35}
        y={0}
        width={w * 0.3}
        height={42}
        fill={`url(#${ids.steel})`}
        stroke="#5f6c73"
        strokeWidth={3}
      />
      <path
        d={`M${x + w * 0.3} 70 L${x + w * 0.7} 70`}
        stroke="#ffffff"
        strokeOpacity={0.5}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {[0.25, 0.5, 0.75].map((share) => (
        <circle key={share} cx={x + w * share} cy={154} r={5} fill="#ffe6a8" />
      ))}
    </g>
  );
}

export function Range({
  ids,
  x,
  w,
  y = 360,
  glow = 1,
}: {
  readonly ids: SceneIds;
  readonly x: number;
  readonly w: number;
  readonly y?: number;
  readonly glow?: number;
}) {
  const rings = [0.2, 0.45, 0.7];
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={150}
        rx={8}
        fill={`url(#${ids.steel})`}
        stroke="#5f6c73"
        strokeWidth={3}
      />
      <rect x={x + 10} y={y + 40} width={w - 20} height={96} rx={6} fill={`url(#${ids.steelDark})`} />
      {[0.3, 0.7].map((share) => (
        <rect key={share} x={x + w * share - 40} y={y + 52} width={80} height={10} rx={5} fill="#9aa6ad" />
      ))}
      {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((share) => (
        <circle
          key={share}
          cx={x + w * share}
          cy={y + 22}
          r={9}
          fill="#2e3a40"
          stroke="#c9d1d5"
          strokeWidth={2}
        />
      ))}
      {rings.map((share) => (
        <g key={share}>
          <ellipse
            cx={x + w * share + 30}
            cy={y - 6}
            rx={46}
            ry={10}
            fill={`url(#${ids.hob})`}
            opacity={glow}
          />
          <ellipse
            cx={x + w * share + 30}
            cy={y - 4}
            rx={36}
            ry={7}
            fill="none"
            stroke="#2e3a40"
            strokeWidth={4}
          />
        </g>
      ))}
    </g>
  );
}

export function PrepFridge({
  ids,
  x,
  y = 330,
}: {
  readonly ids: SceneIds;
  readonly x: number;
  readonly y?: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={150}
        height={180}
        rx={8}
        fill={`url(#${ids.steel})`}
        stroke="#5f6c73"
        strokeWidth={3}
      />
      <rect x={x + 10} y={y + 14} width={130} height={70} rx={4} fill="#c9e4ee" opacity={0.75} />
      <rect x={x + 10} y={y + 96} width={130} height={70} rx={4} fill="#9aa6ad" />
      <path
        d={`M${x + 20} ${y + 40} h40 M${x + 70} ${y + 30} h30 M${x + 100} ${y + 54} h30`}
        stroke="#4f8a3c"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <path
        d={`M${x + 24} ${y + 66} h28 M${x + 64} ${y + 66} h30`}
        stroke="#d9472b"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <rect x={x + 60} y={y + 104} width={30} height={6} rx={3} fill="#e6eaec" />
    </g>
  );
}

export function Counter({
  ids,
  y,
  colour,
  edge,
}: {
  readonly ids: SceneIds;
  readonly y: number;
  readonly colour: string;
  readonly edge: string;
}) {
  return (
    <g>
      <rect x={-20} y={y} width={1240} height={22} fill={colour} />
      <rect x={-20} y={y + 22} width={1240} height={6} fill={edge} />
      <rect x={-20} y={y + 28} width={1240} height={600 - y - 28} fill={`url(#${ids.floor})`} />
      <path d={`M-20 ${y + 3} H1220`} stroke={lighten(colour, 0.4)} strokeWidth={2} opacity={0.6} />
    </g>
  );
}

export function PassLamps({
  ids,
  y = 0,
  count = 4,
}: {
  readonly ids: SceneIds;
  readonly y?: number;
  readonly count?: number;
}) {
  return (
    <g>
      {Array.from({ length: count }, (_, index) => {
        const x = 150 + (index * 900) / Math.max(1, count - 1);
        return (
          <g key={index}>
            <path d={`M${x} ${y} V${y + 70}`} stroke="#2e3a40" strokeWidth={3} />
            <path
              d={`M${x - 34} ${y + 100} L${x - 16} ${y + 70} L${x + 16} ${y + 70} L${x + 34} ${y + 100} Z`}
              fill="#2e3a40"
            />
            <ellipse cx={x} cy={y + 100} rx={34} ry={6} fill="#ffd88a" />
            <path
              d={`M${x - 34} ${y + 100} L${x - 140} ${y + 380} L${x + 140} ${y + 380} L${x + 34} ${y + 100} Z`}
              fill={`url(#${ids.lamp})`}
            />
          </g>
        );
      })}
    </g>
  );
}

export function Shelf({
  x,
  y,
  w,
  jars,
}: {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly jars: readonly string[];
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={10} rx={3} fill="#8a6a44" />
      {jars.map((colour, index) => {
        const jx = x + 14 + (index * (w - 40)) / Math.max(1, jars.length - 1);
        return (
          <g key={index}>
            <rect x={jx - 12} y={y - 40} width={24} height={40} rx={6} fill="#e9f0f2" opacity={0.85} />
            <rect x={jx - 10} y={y - 26} width={20} height={24} rx={4} fill={colour} />
            <rect x={jx - 10} y={y - 46} width={20} height={8} rx={2} fill={darken(colour, 0.3)} />
          </g>
        );
      })}
    </g>
  );
}

import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { PathId } from "../../content/path";

export interface DoorArtProps {
  readonly path: PathId;
  readonly colour: string;
  readonly ajar: boolean;
}

function Glimpse({ path }: { readonly path: PathId }) {
  if (path === "restaurant")
    return (
      <g>
        <rect x={52} y={52} width={96} height={64} fill="#24345e" />
        <path d="M52 100 Q100 90 148 100 V116 H52 Z" fill="#1d3550" />
        <circle cx={128} cy={70} r={8} fill="#ffe2a8" />
        <ellipse cx={100} cy={108} rx={30} ry={6} fill="#fffdf6" />
        <ellipse cx={100} cy={99} rx={3} ry={5} fill="#ffd387" />
      </g>
    );
  if (path === "truck")
    return (
      <g>
        <rect x={52} y={52} width={96} height={64} fill="#9fd3e8" />
        <path d="M52 100 Q100 88 148 100 V116 H52 Z" fill="#8fbf6a" />
        <rect x={66} y={74} width={60} height={30} rx={8} fill="#f28c28" />
        <rect x={74} y={80} width={28} height={12} rx={2} fill="#ffe8b8" />
        <circle cx={78} cy={106} r={6} fill="#1d2528" />
        <circle cx={114} cy={106} r={6} fill="#1d2528" />
        <path d="M60 62 h20 l-10 8 Z M88 60 h20 l-10 8 Z M116 62 h20 l-10 8 Z" fill="#d9472b" />
      </g>
    );
  return (
    <g>
      <rect x={52} y={52} width={96} height={64} fill="#f3e6cf" />
      <rect x={64} y={64} width={34} height={44} rx={3} fill="#4f8a3c" />
      <rect x={68} y={68} width={26} height={36} rx={2} fill="#fbf7ee" />
      <path d="M106 104 q14 -22 28 0" fill="none" stroke="#f2a93b" strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={130} cy={70} rx={8} ry={11} fill="#aeb9bf" />
      <path d="M130 80 V104" stroke="#aeb9bf" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

export function DoorArt({ path, colour, ajar }: DoorArtProps) {
  const glow = useSvgId("ck-door-glow");
  return (
    <svg viewBox="0 0 200 300" className="ck-door-art" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={glow} cx="0.5" cy="1" r="0.8">
          <stop offset="0" stopColor="#ffd88a" stopOpacity={0.95} />
          <stop offset="1" stopColor="#ffd88a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={100} cy={292} rx={96} ry={18} fill={`url(#${glow})`} />
      <rect x={14} y={14} width={172} height={276} rx={12} fill={darken(colour, 0.45)} />
      <rect x={24} y={24} width={152} height={266} rx={8} fill="#ffd88a" opacity={ajar ? 0.95 : 0.2} />
      <g className={ajar ? "ck-door-art__leaf ck-door-art__leaf--ajar" : "ck-door-art__leaf"}>
        <rect x={24} y={24} width={152} height={266} rx={8} fill={colour} />
        <rect x={40} y={40} width={120} height={88} rx={8} fill={darken(colour, 0.3)} />
        <Glimpse path={path} />
        <rect x={52} y={52} width={96} height={64} fill="none" stroke={darken(colour, 0.5)} strokeWidth={4} />
        <rect x={40} y={148} width={120} height={120} rx={8} fill={lighten(colour, 0.12)} />
        <rect
          x={52}
          y={160}
          width={96}
          height={96}
          rx={6}
          fill="none"
          stroke={darken(colour, 0.25)}
          strokeWidth={3}
        />
        <circle cx={154} cy={166} r={9} fill="#f2c46b" stroke="#a3651f" strokeWidth={3} />
      </g>
    </svg>
  );
}

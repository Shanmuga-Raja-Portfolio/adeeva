import type { ReactNode } from "react";
import type { AvatarLook } from "../../../../engine/avatar";
import { colourById } from "../../../../engine/palette";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import { DOLL_VIEWBOX } from "../../../../ui/art/avatar/Croquis";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { OwnedDecor } from "../../core";
import { LeaningBoards, Shavings, SleepyCat, StreetDog, WallClock, WallShelf } from "./GarageProps";
import { SceneGlow } from "./SceneGlow";

interface GarageBackdropProps {
  readonly className?: string | undefined;
  readonly decor?: readonly OwnedDecor[] | undefined;
  readonly evening?: boolean | undefined;
  readonly hour?: number | undefined;
  readonly lively?: boolean | undefined;
  readonly children?: ReactNode;
}

const NEIGHBOUR: AvatarLook = {
  skinTone: "chestnut",
  hairStyle: "curly-puff",
  hairColour: "black",
  outfit: "dungarees",
};

const OUTLINE = "#2f2622";

function PegHoles({ id }: { id: string }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={24} height={24}>
      <rect width={24} height={24} fill="#d9b98a" />
      <circle cx={12} cy={12} r={2.6} fill="#9c7a4f" />
      <circle cx={12.6} cy={12.6} r={1.6} fill="#7d5f3c" />
    </pattern>
  );
}

function Tools({ outlines }: { outlines: boolean }) {
  const shadow = outlines ? (
    <g fill="none" stroke="#fff6de" strokeWidth={6} strokeLinejoin="round" opacity={0.9}>
      <path d="M612 170 h22 v120 h-22 Z M596 160 h54 v26 h-54 Z" />
      <path d="M720 160 L860 160 L860 196 L730 232 Z" />
      <rect x={918} y={150} width={18} height={180} rx={4} />
      <path d="M1010 168 h60 v20 h-60 Z M1032 188 v90" />
    </g>
  ) : null;
  return (
    <g>
      {shadow}
      <g stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round">
        <rect x={612} y={176} width={22} height={116} rx={6} fill="#c58a4a" />
        <rect x={594} y={156} width={58} height={30} rx={6} fill="#f2c230" />
        <path d="M720 160 L860 160 L860 196 L730 232 Z" fill="#cfd6dc" />
        <path
          d="M736 230 l6 -8 l6 8 l6 -8 l6 8 l6 -8 l6 8 l6 -8 l6 8 l6 -8 l6 8 l6 -8 l6 8 l6 -8 l6 8 l6 -8 l6 8 l6 -8 l6 8"
          fill="none"
          strokeWidth={2}
        />
        <path d="M856 154 h46 a12 12 0 0 1 12 12 v34 h-58 Z" fill="#c0392b" />
        <rect x={870} y={166} width={30} height={20} rx={7} fill="#fbf3e6" />
        <rect x={918} y={150} width={18} height={180} rx={4} fill="#f2c230" />
        <path
          d="M918 170 h9 M918 190 h12 M918 210 h9 M918 230 h12 M918 250 h9 M918 270 h12 M918 290 h9 M918 310 h12"
          strokeWidth={2}
        />
        <rect x={1010} y={164} width={64} height={26} rx={5} fill="#4a6378" />
        <rect x={1034} y={188} width={16} height={92} rx={5} fill="#a4764b" />
      </g>
      <g fill="#7d5f3c">
        <circle cx={623} cy={148} r={5} />
        <circle cx={790} cy={150} r={5} />
        <circle cx={927} cy={142} r={5} />
        <circle cx={1042} cy={156} r={5} />
      </g>
    </g>
  );
}

export function GarageBackdrop({
  className,
  decor = [],
  evening = false,
  hour = 9,
  lively = false,
  children,
}: GarageBackdropProps) {
  const id = useSvgId("ww-garage");
  const doorPaint = decor.find((entry) => entry.id === "door-paint")?.paint ?? null;
  const doorHex = doorPaint === null ? "#8fa3b3" : colourById(doorPaint).hex;
  const outlines = decor.some((entry) => entry.id === "pegboard-tools");
  const lamp = decor.some((entry) => entry.id === "bench-lamp");
  return (
    <svg
      className={className}
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={evening ? "#d8b996" : "#f4dfbf"} />
          <stop offset="1" stopColor={evening ? "#c49f78" : "#e8caa0"} />
        </linearGradient>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={evening ? "#f1a36b" : "#9fd0ee"} />
          <stop offset="1" stopColor={evening ? "#f7d59a" : "#e9f6ff"} />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9bba6" />
          <stop offset="1" stopColor="#ad9e88" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff6d6" stopOpacity={evening ? 0.18 : 0.55} />
          <stop offset="1" stopColor="#fff6d6" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-lamp`} cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor="#ffe8a8" stopOpacity={evening ? 0.75 : 0.45} />
          <stop offset="1" stopColor="#ffe8a8" stopOpacity={0} />
        </radialGradient>
        <PegHoles id={`${id}-peg`} />
      </defs>
      <rect width={1200} height={700} fill={`url(#${id}-wall)`} />
      <g stroke="#dcbf94" strokeWidth={2} opacity={0.5}>
        {[480, 560, 640, 720, 800, 880, 960, 1040, 1120].map((x) => (
          <path key={x} d={`M${x} 0 V600`} />
        ))}
      </g>
      <WallShelf />
      <rect x={40} y={100} width={400} height={540} rx={6} fill="#6f5a4a" stroke={OUTLINE} strokeWidth={4} />
      <rect x={64} y={124} width={352} height={516} fill={`url(#${id}-sky)`} />
      <g>
        <circle cx={340} cy={250} r={54} fill={evening ? "#ffcf7a" : "#fff3b0"} opacity={0.35} />
        <circle cx={340} cy={250} r={34} fill={evening ? "#ffcf7a" : "#fff3b0"} opacity={0.95} />
        <path d="M64 470 Q150 430 240 452 T416 440 V640 H64 Z" fill="#b5d6a4" />
        <path d="M64 520 Q160 480 260 506 T416 494 V640 H64 Z" fill="#8cbf7a" />
        <g stroke="#7a8f6f" strokeWidth={2}>
          <path d="M330 470 h70 v-40 l-35 -28 l-35 28 Z" fill="#f1e2c8" />
          <rect x={356} y={444} width={16} height={26} fill="#c0574a" />
          <rect x={338} y={438} width={12} height={10} fill="#bfe2f2" />
        </g>
        <rect x={96} y={380} width={16} height={150} fill="#7a5233" />
        <circle cx={104} cy={350} r={58} fill="#4f8a5b" stroke="#3d5f45" strokeWidth={3} />
        <circle cx={140} cy={384} r={34} fill="#5f9b66" stroke="#3d5f45" strokeWidth={3} />
        <circle cx={86} cy={330} r={18} fill="#6fae74" opacity={0.7} />
        <path d="M64 572 H416 V640 H64 Z" fill="#d8d2c4" />
        <path d="M64 572 H416" stroke="#b5ad9c" strokeWidth={3} />
        <path d="M150 572 l-16 68 M260 572 l-6 68 M370 572 l6 68" stroke="#c4bcac" strokeWidth={2} />
        {lively ? (
          <>
            <svg x={160} y={400} width={96} height={192} viewBox={DOLL_VIEWBOX}>
              <AvatarFigure look={NEIGHBOUR} pose="wave" />
            </svg>
            <StreetDog />
          </>
        ) : null}
      </g>
      <g stroke={OUTLINE} strokeWidth={3}>
        {[0, 1, 2, 3].map((slat) => (
          <rect key={slat} x={64} y={124 + slat * 24} width={352} height={24} fill={doorHex} />
        ))}
        <rect x={64} y={214} width={352} height={14} rx={4} fill="#5b4a3d" />
        <rect x={226} y={218} width={28} height={8} rx={3} fill="#cfd6dc" />
      </g>
      <polygon points="416,240 416,640 860,700 600,700" fill={`url(#${id}-beam)`} />
      <rect
        x={520}
        y={110}
        width={620}
        height={300}
        rx={8}
        fill={`url(#${id}-peg)`}
        stroke={OUTLINE}
        strokeWidth={4}
      />
      <Tools outlines={outlines} />
      <WallClock hour={hour} />
      <LeaningBoards />
      <rect x={0} y={600} width={1200} height={100} fill={`url(#${id}-floor)`} />
      <path d="M0 600 H1200" stroke={OUTLINE} strokeWidth={3} />
      <g stroke="#b3a48d" strokeWidth={2} opacity={0.6}>
        <path d="M0 640 H1200 M300 600 L180 700 M700 600 L720 700 M1060 600 L1180 700" />
      </g>
      <ellipse cx={830} cy={622} rx={360} ry={18} fill="#2f2622" opacity={0.16} />
      <g stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round">
        <rect x={500} y={440} width={660} height={36} rx={6} fill="#b97f43" />
        <path d="M500 452 H1160" stroke="#8f5a26" strokeWidth={2} />
        <rect x={530} y={476} width={30} height={140} fill="#9c6a37" />
        <rect x={1100} y={476} width={30} height={140} fill="#9c6a37" />
        <rect x={560} y={560} width={540} height={18} fill="#9c6a37" />
        <rect x={1060} y={404} width={60} height={36} rx={4} fill="#4a6378" />
        <rect x={1050} y={396} width={80} height={14} rx={4} fill="#33475a" />
        <rect x={640} y={418} width={240} height={22} rx={3} fill="#e7b777" />
        <path d="M650 428 Q720 422 790 430 T870 426" stroke="#b07a3f" strokeWidth={2} fill="none" />
        <path d="M940 440 l18 -54 h36 l18 54 Z" fill="#d4774f" />
        <rect x={510} y={424} width={46} height={16} rx={3} fill="#4a6378" />
        <rect x={500} y={414} width={16} height={36} rx={3} fill="#33475a" />
      </g>
      <g fill="#4f8a5b" stroke={OUTLINE} strokeWidth={2.5}>
        <path d="M976 388 C960 352 940 344 922 348 C944 356 958 368 972 392 Z" />
        <path d="M976 388 C990 350 1012 342 1030 348 C1008 356 994 370 980 392 Z" />
        <path d="M976 390 C972 360 980 334 994 320 C988 346 984 366 980 392 Z" />
      </g>
      {children}
      <Shavings />
      {lively ? <SleepyCat /> : null}
      {lamp ? (
        <g>
          <polygon points="760,90 600,440 920,440" fill={`url(#${id}-lamp)`} />
          <line x1={760} y1={0} x2={760} y2={70} stroke={OUTLINE} strokeWidth={4} />
          <path d="M724 96 Q760 56 796 96 Z" fill="#3f6b4f" stroke={OUTLINE} strokeWidth={4} />
          <circle cx={760} cy={100} r={10} fill="#fff1b8" stroke={OUTLINE} strokeWidth={3} />
        </g>
      ) : null}
      {evening ? <rect width={1200} height={700} fill="#3b2a4a" opacity={0.18} /> : null}
      <SceneGlow
        id={`${id}-glow`}
        warmth={evening ? "#ffc37a" : "#fff1c4"}
        from={[416, 230]}
        evening={evening}
      />
    </svg>
  );
}

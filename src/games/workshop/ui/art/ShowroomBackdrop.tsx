import type { ReactNode } from "react";
import { colourById } from "../../../../engine/palette";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { FAIR_THEME_IDS, type FairThemeId } from "../../content/fairTheme";
import type { RosetteId } from "../../content/rosette";
import { setTemplateById, type FloorSet, type OwnedDecor } from "../../core";
import { floorLooks } from "./pieceLook";
import { PiecePreview } from "./PiecePreview";
import { RosetteArt } from "./RosetteArt";
import { SceneGlow } from "./SceneGlow";

interface ShowroomBackdropProps {
  readonly className?: string | undefined;
  readonly decor?: readonly OwnedDecor[] | undefined;
  readonly floor?: readonly FloorSet[] | undefined;
  readonly rail?: Readonly<Partial<Record<FairThemeId, RosetteId>>> | undefined;
  readonly evening?: boolean | undefined;
  readonly floorFocus?: boolean | undefined;
  readonly plaques?: boolean | undefined;
  readonly children?: ReactNode;
}

const OUTLINE = "#2f2622";
const RUG_COLOURS = ["#c0574a", "#4a6378", "#3f6b4f"];
const RUG_SPOTS: readonly { cx: number; cy: number; width: number; scale: number }[] = [
  { cx: 500, cy: 652, width: 380, scale: 1 },
  { cx: 800, cy: 548, width: 300, scale: 0.82 },
  { cx: 1010, cy: 660, width: 290, scale: 0.92 },
];

function Fern({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 96)`} stroke={OUTLINE} strokeWidth={2.5}>
      <line x1={0} y1={-96} x2={0} y2={0} />
      <path d="M-22 0 h44 l-6 26 h-32 Z" fill="#d4774f" />
      <g fill="#4f8a5b">
        <path d="M0 4 C-30 10 -46 36 -50 62 C-34 44 -18 30 0 22 Z" />
        <path d="M0 4 C30 10 46 36 50 62 C34 44 18 30 0 22 Z" />
        <path d="M-6 8 C-12 40 -8 64 0 84 C6 62 8 40 6 8 Z" />
      </g>
    </g>
  );
}

function RockingHorse() {
  return (
    <g transform="translate(470 520)" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round">
      <path d="M-70 70 Q0 100 70 70" fill="none" stroke="#8f5a26" strokeWidth={8} />
      <path d="M-40 66 L-30 20 M40 66 L30 20" stroke="#8f5a26" strokeWidth={6} />
      <path d="M-44 20 Q-46 -6 -10 -6 H30 L48 -40 Q62 -44 66 -30 L54 -2 Q50 20 36 20 Z" fill="#f2e6cf" />
      <path d="M48 -40 Q40 -56 52 -60 Q58 -50 60 -42" fill="#c0574a" />
      <circle cx={56} cy={-30} r={2.5} fill={OUTLINE} />
      <path d="M-44 4 Q-64 10 -62 34" fill="none" stroke="#c0574a" strokeWidth={6} />
    </g>
  );
}

function FloorPlaque({ x, y, name }: { readonly x: number; readonly y: number; readonly name: string }) {
  const width = name.length * 11 + 30;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-width / 2 + 3} y={1} width={width} height={30} rx={8} fill={OUTLINE} opacity={0.3} />
      <rect
        x={-width / 2}
        y={-2}
        width={width}
        height={30}
        rx={8}
        fill="#fffaf0"
        stroke={OUTLINE}
        strokeWidth={2.5}
      />
      <text
        y={19}
        textAnchor="middle"
        fontSize={18}
        fontWeight={700}
        fontFamily='"Rockwell", "Roboto Slab", Georgia, serif'
        fill="#33475a"
      >
        {name}
      </text>
    </g>
  );
}

function WallDressing() {
  return (
    <g>
      <rect y={384} width={1200} height={86} fill="#b9c7a2" opacity={0.75} />
      <path d="M0 384 H1200" stroke="#8f9e7a" strokeWidth={6} />
      <g stroke="#9fae88" strokeWidth={3} fill="none">
        {[480, 600, 720, 840].map((x) => (
          <rect key={x} x={x} y={398} width={100} height={58} rx={4} />
        ))}
      </g>
      <g stroke={OUTLINE} strokeWidth={3}>
        <rect x={470} y={226} width={104} height={84} rx={3} fill="#c58a4a" />
        <rect x={480} y={236} width={84} height={64} fill="#f6e7c4" />
        <path d="M480 286 Q510 258 532 276 T564 270 V300 H480 Z" fill="#9cb59a" strokeWidth={2} />
        <circle cx={546} cy={254} r={8} fill="#f2c230" strokeWidth={2} />
        <rect x={592} y={250} width={64} height={78} rx={3} fill="#4a6378" />
        <rect x={600} y={258} width={48} height={62} fill="#f2e6cf" />
        <path d="M614 306 q10 -30 20 0 Z" fill="#c0574a" strokeWidth={2} />
      </g>
      {[640, 800].map((x) => (
        <g key={x}>
          <path d={`M${x} 0 V104`} stroke={OUTLINE} strokeWidth={3} />
          <polygon
            points={`${x - 26},140 ${x + 26},140 ${x + 150},470 ${x - 150},470`}
            fill="#fff1c4"
            opacity={0.16}
          />
          <path
            d={`M${x - 30} 140 Q${x - 30} 104 ${x} 104 Q${x + 30} 104 ${x + 30} 140 Z`}
            fill="#3f6b4f"
            stroke={OUTLINE}
            strokeWidth={3}
          />
          <ellipse cx={x} cy={142} rx={12} ry={6} fill="#fff1b8" stroke={OUTLINE} strokeWidth={2} />
        </g>
      ))}
    </g>
  );
}

export function ShowroomBackdrop({
  className,
  decor = [],
  floor = [],
  rail = {},
  evening = false,
  floorFocus = false,
  plaques = false,
  children,
}: ShowroomBackdropProps) {
  const id = useSvgId("ww-showroom");
  const signPaint = decor.find((entry) => entry.id === "shop-sign")?.paint ?? null;
  const signHex = signPaint === null ? "#4a6378" : colourById(signPaint).hex;
  const ferns = decor.some((entry) => entry.id === "window-ferns");
  const horse = decor.some((entry) => entry.id === "rocking-horse");
  return (
    <svg
      className={className}
      viewBox="0 0 1200 700"
      preserveAspectRatio={floorFocus ? "xMidYMax slice" : "xMidYMid slice"}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={evening ? "#cfd7c2" : "#e9efd9"} />
          <stop offset="1" stopColor={evening ? "#b7c2a6" : "#d5e0c2"} />
        </linearGradient>
        <linearGradient id={`${id}-street`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={evening ? "#f1a36b" : "#bfe2f6"} />
          <stop offset="1" stopColor={evening ? "#f7d59a" : "#f2fbff"} />
        </linearGradient>
        <pattern id={`${id}-planks`} patternUnits="userSpaceOnUse" width={160} height={34}>
          <rect width={160} height={34} fill="#c99662" />
          <path d="M0 33 H160 M80 0 V17 M20 17 V34 M120 17 V34 M0 17 H160" stroke="#a87545" strokeWidth={2} />
        </pattern>
      </defs>
      <rect width={1200} height={700} fill={`url(#${id}-wall)`} />
      <g stroke="#b9c7a2" strokeWidth={10} opacity={0.5}>
        {[120, 260, 400, 540, 680, 820, 960, 1100].map((x) => (
          <line key={x} x1={x} y1={0} x2={x} y2={470} />
        ))}
      </g>
      <WallDressing />
      <rect x={40} y={70} width={400} height={56} rx={8} fill={signHex} stroke={OUTLINE} strokeWidth={4} />
      <text
        x={240}
        y={107}
        textAnchor="middle"
        fontSize={26}
        fontWeight={700}
        fontFamily='"Rockwell", "Roboto Slab", Georgia, serif'
        fill="#fffaf0"
      >
        Larkspur Road Showroom
      </text>
      <rect x={40} y={140} width={400} height={330} rx={6} fill="#6f5a4a" stroke={OUTLINE} strokeWidth={4} />
      <rect x={60} y={160} width={360} height={290} fill={`url(#${id}-street)`} />
      <g>
        <path d="M60 370 h360 v80 H60 Z" fill="#c9c3b6" />
        <path d="M60 370 h360" stroke="#9c958a" strokeWidth={4} />
        <rect x={110} y={250} width={110} height={120} fill="#e8d2b4" stroke={OUTLINE} strokeWidth={3} />
        <path d="M104 254 l61 -50 l61 50 Z" fill="#c0574a" stroke={OUTLINE} strokeWidth={3} />
        <rect x={150} y={316} width={30} height={54} fill="#4a6378" stroke={OUTLINE} strokeWidth={2} />
        <circle cx={330} cy={300} r={44} fill="#5f9b66" stroke={OUTLINE} strokeWidth={3} />
        <rect x={322} y={334} width={16} height={36} fill="#7a5233" />
        <circle cx={380} cy={210} r={26} fill={evening ? "#ffcf7a" : "#fff3b0"} />
      </g>
      <path d="M240 160 V450 M60 300 H420" stroke="#6f5a4a" strokeWidth={6} />
      {ferns ? (
        <g>
          <Fern x={110} />
          <Fern x={370} />
        </g>
      ) : null}
      <g>
        <rect
          x={690}
          y={150}
          width={470}
          height={16}
          rx={6}
          fill="#8f5a26"
          stroke={OUTLINE}
          strokeWidth={3}
        />
        {FAIR_THEME_IDS.map((themeId, index) => {
          const x = 724 + index * 58;
          const rosette = rail[themeId];
          return (
            <g key={themeId}>
              <path d={`M${x} 166 v14`} stroke={OUTLINE} strokeWidth={3} />
              {rosette === undefined ? (
                <circle
                  cx={x}
                  cy={188}
                  r={7}
                  fill="none"
                  stroke="#8f5a26"
                  strokeWidth={3}
                  strokeDasharray="4 3"
                />
              ) : (
                <g transform={`translate(${x} 210) scale(0.42)`}>
                  <RosetteArt rosetteId={rosette} />
                </g>
              )}
            </g>
          );
        })}
      </g>
      <rect x={0} y={470} width={1200} height={230} fill={`url(#${id}-planks)`} />
      <path d="M0 470 H1200" stroke={OUTLINE} strokeWidth={4} />
      <g stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round">
        <rect x={860} y={380} width={300} height={40} rx={6} fill="#b97f43" />
        <rect x={880} y={420} width={260} height={180} fill="#9c6a37" />
        <path d="M900 440 h220 M900 480 h220 M900 520 h220" stroke="#7d5328" strokeWidth={3} />
        <path d="M1090 380 q14 -26 28 0 Z" fill="#f2c230" />
      </g>
      {horse ? <RockingHorse /> : null}
      {[...floor]
        .sort((a, b) => (RUG_SPOTS[a.bay]?.cy ?? 0) - (RUG_SPOTS[b.bay]?.cy ?? 0))
        .map((set) => {
          const looks = floorLooks(set);
          const rug = RUG_SPOTS[set.bay] ?? RUG_SPOTS[0];
          if (rug === undefined) return null;
          const each = Math.min(360 * rug.scale, (rug.width * 1.7) / Math.max(1, looks.length));
          const start = rug.cx - (each * looks.length) / 2;
          return (
            <g key={set.setId}>
              <ellipse
                cx={rug.cx}
                cy={rug.cy}
                rx={rug.width / 2}
                ry={30 * rug.scale}
                fill={RUG_COLOURS[set.bay % RUG_COLOURS.length]}
                stroke={OUTLINE}
                strokeWidth={3}
                opacity={0.92}
              />
              {looks.map((look, index) => (
                <svg
                  key={index}
                  x={start + index * each}
                  y={rug.cy + 6 - (each / 1.2) * 0.85}
                  width={each}
                  height={each / 1.2}
                  viewBox="0 0 300 250"
                >
                  <PiecePreview look={look} title={null} showExtras />
                </svg>
              ))}
              {plaques ? (
                <FloorPlaque x={rug.cx} y={rug.cy + 2} name={setTemplateById(set.templateId).name} />
              ) : null}
            </g>
          );
        })}
      {children}
      {evening ? <rect width={1200} height={700} fill="#3b2a4a" opacity={0.18} /> : null}
      <SceneGlow
        id={`${id}-glow`}
        warmth={evening ? "#ffc37a" : "#fff1c4"}
        from={[420, 170]}
        evening={evening}
      />
    </svg>
  );
}

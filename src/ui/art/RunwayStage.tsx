import { RUNWAY_VIEW } from "./runwayGeometry";
import { walkerFrame } from "./runwayWalker";
import type { ReactNode } from "react";
import type { RunwayLightId } from "../../content/runwayLight";
import { DOLL_VIEWBOX } from "./Croquis";
import { RunwayAudience } from "./RunwayAudience";
import { seededUnit } from "./seedFromText";
import { useSvgId } from "./useSvgId";

export interface RunwayStageProps {
  light: RunwayLightId;
  progress: number;
  flashes?: boolean | undefined;
  venue?: string | undefined;
  title?: string | undefined;
  className?: string | undefined;
  children?: ReactNode;
}

interface LightPalette {
  wallTop: string;
  wallBottom: string;
  floor: string;
  beam: string;
  rim: string;
  runway: string;
  curtain: string;
}

const palettes: Record<RunwayLightId, LightPalette> = {
  warm: {
    wallTop: "#24101c",
    wallBottom: "#5a2433",
    floor: "#1d0f16",
    beam: "#ffd39a",
    rim: "#ffb879",
    runway: "#4a2a33",
    curtain: "#7a2840",
  },
  cool: {
    wallTop: "#0b1030",
    wallBottom: "#26306a",
    floor: "#0c0f24",
    beam: "#b3d0ff",
    rim: "#93b8ff",
    runway: "#2c3560",
    curtain: "#2b3c7a",
  },
  spotlight: {
    wallTop: "#08070c",
    wallBottom: "#1a1622",
    floor: "#09080d",
    beam: "#fff4dc",
    rim: "#f3e6ff",
    runway: "#26222e",
    curtain: "#3a2a44",
  },
};

const lampXs = [260, 430, 600, 740, 860, 1000, 1170, 1340];

function Flashes({ rim, glowId }: { rim: string; glowId: string }) {
  const bursts = Array.from({ length: 14 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const spread = seededUnit(7, index);
    const x = 800 + side * (260 + spread * 480);
    const y = 520 + seededUnit(11, index) * 300;
    const size = 12 + seededUnit(13, index) * 18;
    return { x, y, size, delay: (seededUnit(17, index) * 1.6).toFixed(2) };
  });
  return (
    <g className="ad-runway-flashes" pointerEvents="none">
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.7} />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity={0.18} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
      </defs>
      {bursts.map((burst, index) => (
        <g
          key={index}
          className="ad-runway-flash"
          style={{ animationDelay: `${burst.delay}s` }}
          transform={`translate(${burst.x.toFixed(1)} ${burst.y.toFixed(1)})`}
        >
          <circle r={burst.size * 1.8} fill={`url(#${glowId})`} />
          <path
            d={`M0 ${-burst.size} Q${burst.size * 0.12} ${-burst.size * 0.12} ${burst.size} 0 Q${burst.size * 0.12} ${burst.size * 0.12} 0 ${burst.size} Q${-burst.size * 0.12} ${burst.size * 0.12} ${-burst.size} 0 Q${-burst.size * 0.12} ${-burst.size * 0.12} 0 ${-burst.size} Z`}
            fill="#ffffff"
          />
          <circle r={burst.size * 0.22} fill={rim} />
        </g>
      ))}
    </g>
  );
}

export function RunwayStage({
  light,
  progress,
  flashes = false,
  venue,
  title,
  className,
  children,
}: RunwayStageProps) {
  const id = useSvgId("runway");
  const palette = palettes[light];
  const walker = walkerFrame(progress);
  const spotlight = light === "spotlight";
  const { width, height, horizon } = RUNWAY_VIEW;
  const runwayPath = `M736 ${horizon} L864 ${horizon} L1210 ${height} L390 ${height} Z`;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={title ?? `Runway show under ${light} lighting`}
    >
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.wallTop} />
          <stop offset="1" stopColor={palette.wallBottom} />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.wallBottom} />
          <stop offset="0.2" stopColor={palette.floor} />
          <stop offset="1" stopColor={palette.floor} />
        </linearGradient>
        <linearGradient id={`${id}-runway`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.runway} />
          <stop offset="1" stopColor="#f6eef2" stopOpacity={0.9} />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.beam} stopOpacity={0.05} />
          <stop offset="0.6" stopColor={palette.beam} stopOpacity={0.35} />
          <stop offset="1" stopColor={palette.beam} stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.beam} stopOpacity={0.55} />
          <stop offset="1" stopColor={palette.beam} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={palette.beam} stopOpacity={0.6} />
          <stop offset="1" stopColor={palette.beam} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-curtain`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={palette.curtain} />
          <stop offset="0.5" stopColor={palette.wallTop} />
          <stop offset="1" stopColor={palette.curtain} />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#000000" stopOpacity={0} />
          <stop offset="1" stopColor="#000000" stopOpacity={spotlight ? 0.7 : 0.45} />
        </radialGradient>
      </defs>
      <rect width={width} height={horizon + 20} fill={`url(#${id}-wall)`} />
      <rect y={horizon} width={width} height={height - horizon} fill={`url(#${id}-floor)`} />
      <g opacity={spotlight ? 0.45 : 0.85}>
        {Array.from({ length: 13 }, (_, index) => {
          const x = 120 + index * 112;
          return (
            <path
              key={index}
              d={`M${x} 90 C${x + 18} 200 ${x - 14} 300 ${x + 6} ${horizon}`}
              stroke={palette.curtain}
              strokeOpacity={0.45}
              strokeWidth={30}
              fill="none"
            />
          );
        })}
      </g>
      <path
        d={`M600 ${horizon} L600 210 C600 120 1000 120 1000 210 L1000 ${horizon} Z`}
        fill={palette.wallTop}
        stroke={palette.rim}
        strokeOpacity={0.5}
        strokeWidth={3}
      />
      <path
        d={`M630 ${horizon} L630 220 C630 150 970 150 970 220 L970 ${horizon} Z`}
        fill="#000000"
        opacity={0.55}
      />
      <path
        d={`M630 ${horizon} L630 220 C640 160 700 150 720 150 C700 220 690 320 700 ${horizon} Z M970 ${horizon} L970 220 C960 160 900 150 880 150 C900 220 910 320 900 ${horizon} Z`}
        fill={`url(#${id}-curtain)`}
      />
      {venue ? (
        <text
          x={800}
          y={112}
          textAnchor="middle"
          fontFamily='"Playfair Display", Georgia, serif'
          fontSize={34}
          letterSpacing={6}
          fill={palette.rim}
          opacity={0.9}
        >
          {venue.toUpperCase()}
        </text>
      ) : null}
      <rect x={160} y={30} width={1280} height={18} rx={4} fill="#2a2630" stroke="#55505e" strokeWidth={2} />
      <path d="M170 34 L1430 34 M170 44 L1430 44" stroke="#6b6575" strokeWidth={1} strokeDasharray="14 10" />
      {spotlight ? (
        <path
          d={`M780 48 L820 48 L${800 + walker.width * 0.85} ${walker.feet + 10} L${800 - walker.width * 0.85} ${walker.feet + 10} Z`}
          fill={`url(#${id}-beam)`}
          className="ad-runway-beam"
        />
      ) : (
        lampXs.map((x, index) => {
          const target = 800 + (x - 800) * 0.35;
          return (
            <path
              key={x}
              d={`M${x - 12} 52 L${x + 12} 52 L${target + 140} ${height} L${target - 140} ${height} Z`}
              fill={`url(#${id}-beam)`}
              opacity={0.35 + (index % 3) * 0.08}
              className="ad-runway-beam"
            />
          );
        })
      )}
      {(spotlight ? [800] : lampXs).map((x) => (
        <g key={`lamp-${x}`} transform={`translate(${x} 48)`}>
          <rect
            x={-16}
            y={-6}
            width={32}
            height={22}
            rx={6}
            fill="#1f1c24"
            stroke="#4a4552"
            strokeWidth={2}
          />
          <ellipse cx={0} cy={17} rx={13} ry={5} fill={palette.beam} />
          <ellipse cx={0} cy={17} rx={30} ry={12} fill={palette.beam} opacity={0.25} />
        </g>
      ))}
      <path d={runwayPath} fill={`url(#${id}-runway)`} opacity={0.95} />
      <path
        d={`M780 ${horizon} L820 ${horizon} L940 ${height} L660 ${height} Z`}
        fill={`url(#${id}-shine)`}
      />
      <path
        d={`M736 ${horizon} L390 ${height} M864 ${horizon} L1210 ${height}`}
        stroke={palette.rim}
        strokeWidth={4}
        strokeDasharray="2 16"
        strokeLinecap="round"
        opacity={0.9}
      />
      <RunwayAudience rim={palette.rim} layer="back" />
      <ellipse
        cx={800}
        cy={walker.feet}
        rx={walker.width * (spotlight ? 0.9 : 0.6)}
        ry={walker.width * 0.12}
        fill={`url(#${id}-pool)`}
      />
      <ellipse
        cx={800}
        cy={walker.feet - 2}
        rx={walker.width * 0.28}
        ry={walker.width * 0.05}
        fill="#000000"
        opacity={0.35}
      />
      <svg
        x={walker.x}
        y={walker.y}
        width={walker.width}
        height={walker.height}
        viewBox={DOLL_VIEWBOX}
        overflow="visible"
      >
        {children}
      </svg>
      <RunwayAudience rim={palette.rim} layer="front" />
      {flashes ? <Flashes rim={palette.rim} glowId={`${id}-flash`} /> : null}
      <rect width={width} height={height} fill={`url(#${id}-vignette)`} pointerEvents="none" />
    </svg>
  );
}

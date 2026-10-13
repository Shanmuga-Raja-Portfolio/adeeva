import type { ReactNode } from "react";
import type { TrimId } from "../../content/trim";
import { darken, lighten } from "./colourMix";
import { useSvgId } from "./useSvgId";

export const TRIM_EXTENT: Record<TrimId, { width: number; height: number }> = {
  button: { width: 18, height: 18 },
  bow: { width: 44, height: 34 },
  lace: { width: 84, height: 18 },
  "flower-applique": { width: 34, height: 34 },
  "sequin-patch": { width: 34, height: 30 },
  "ribbon-belt": { width: 84, height: 36 },
  pearl: { width: 11, height: 11 },
  "star-applique": { width: 30, height: 30 },
};

const TRIM_DEFAULT_TINT: Record<TrimId, string> = {
  button: "#efe2c8",
  bow: "#d0587e",
  lace: "#fbf4e6",
  "flower-applique": "#f08aa8",
  "sequin-patch": "#c9a227",
  "ribbon-belt": "#2b2230",
  pearl: "#f6f0e6",
  "star-applique": "#e2b93b",
};

export interface TrimArtProps {
  trimId: TrimId;
  x?: number | undefined;
  y?: number | undefined;
  rotation?: number | undefined;
  scale?: number | undefined;
  tint?: string | undefined;
  selected?: boolean | undefined;
}

function sequinColours(base: string): string[] {
  return [lighten(base, 0.35), "#e9b7c9", "#c9d5ea", base, "#f4e3a1", "#d6c4ef"];
}

function trimBody(trimId: TrimId, tint: string, id: string): ReactNode {
  const light = lighten(tint, 0.45);
  const deep = darken(tint, 0.35);
  const gradient = `url(#${id}-g)`;
  switch (trimId) {
    case "button":
      return (
        <>
          <circle cx={0.8} cy={1.4} r={8.4} fill="#1c1220" opacity={0.2} />
          <circle r={8.4} fill={gradient} stroke={deep} strokeWidth={0.8} />
          <circle r={6.2} fill="none" stroke={deep} strokeOpacity={0.4} strokeWidth={0.8} />
          {[
            [-2, -2],
            [2, -2],
            [-2, 2],
            [2, 2],
          ].map(([cx, cy]) => (
            <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={0.95} fill={deep} />
          ))}
          <path d="M-2 -2 L2 2 M2 -2 L-2 2" stroke={darken(tint, 0.55)} strokeWidth={0.7} />
          <path
            d="M-5.6 -3.6 A6.6 6.6 0 0 1 -1 -6.4"
            stroke="#ffffff"
            strokeOpacity={0.7}
            strokeWidth={1.3}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case "bow":
      return (
        <>
          <path d="M-2 2 C-6 10 -11 18 -15 25 L-8 26 C-5 18 -2 10 0 3 Z" fill={deep} />
          <path d="M2 2 C6 10 11 18 15 25 L8 26 C5 18 2 10 0 3 Z" fill={deep} />
          <path
            d="M-1 0 C-9 -14 -24 -14 -21 -1 C-19 9 -8 7 -1 0 Z"
            fill={gradient}
            stroke={deep}
            strokeWidth={0.8}
          />
          <path
            d="M1 0 C9 -14 24 -14 21 -1 C19 9 8 7 1 0 Z"
            fill={gradient}
            stroke={deep}
            strokeWidth={0.8}
          />
          <path
            d="M-4 -1 C-9 -6 -15 -8 -18 -4 M4 -1 C9 -6 15 -8 18 -4"
            stroke={deep}
            strokeOpacity={0.55}
            strokeWidth={0.9}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M-15 -8 C-12 -10 -8 -9 -6 -6 M15 -8 C12 -10 8 -9 6 -6"
            stroke="#ffffff"
            strokeOpacity={0.55}
            strokeWidth={1.2}
            fill="none"
            strokeLinecap="round"
          />
          <rect
            x={-4.5}
            y={-5}
            width={9}
            height={10}
            rx={3.5}
            fill={gradient}
            stroke={deep}
            strokeWidth={0.8}
          />
          <path d="M-2 -3 L-2 3" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={1} strokeLinecap="round" />
        </>
      );
    case "lace": {
      const scallops: string[] = ["M-40 -6 L40 -6 L40 3"];
      for (let x = 40; x > -40; x -= 8) {
        scallops.push(`A4 4.4 0 0 1 ${x - 8} 3`);
      }
      scallops.push("Z");
      return (
        <>
          <path d={scallops.join(" ")} transform="translate(0.6 1.2)" fill="#1c1220" opacity={0.14} />
          <path d={scallops.join(" ")} fill={tint} stroke={darken(tint, 0.2)} strokeWidth={0.6} />
          {[-36, -28, -20, -12, -4, 4, 12, 20, 28, 36].map((x) => (
            <g key={x}>
              <circle cx={x} cy={-1} r={1.7} fill="none" stroke={darken(tint, 0.28)} strokeWidth={0.6} />
              <circle cx={x} cy={-1} r={0.6} fill={darken(tint, 0.25)} />
              <path
                d={`M${x - 4} 3 Q${x} 6 ${x + 4} 3`}
                fill="none"
                stroke={darken(tint, 0.22)}
                strokeWidth={0.5}
              />
            </g>
          ))}
          {[-38, -34, -30, -26, -22, -18, -14, -10, -6, -2, 2, 6, 10, 14, 18, 22, 26, 30, 34, 38].map((x) => (
            <circle
              key={`p${x}`}
              cx={x}
              cy={-6.4}
              r={0.8}
              fill={tint}
              stroke={darken(tint, 0.22)}
              strokeWidth={0.4}
            />
          ))}
          <path
            d="M-40 -4.4 L40 -4.4"
            stroke={darken(tint, 0.2)}
            strokeWidth={0.5}
            strokeDasharray="1.4 1.2"
          />
        </>
      );
    }
    case "flower-applique":
      return (
        <>
          <path d="M2 6 C8 6 14 10 16 15 C10 16 4 13 2 6 Z" fill="#6f9a74" />
          <path d="M-2 6 C-8 8 -12 13 -13 17 C-7 17 -3 13 -2 6 Z" fill="#5d8a64" />
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx={0}
              cy={-7.4}
              rx={5.4}
              ry={7.6}
              fill={gradient}
              stroke={deep}
              strokeWidth={0.6}
              transform={`rotate(${angle})`}
            />
          ))}
          {[36, 108, 180, 252, 324].map((angle) => (
            <ellipse
              key={angle}
              cx={0}
              cy={-4.6}
              rx={3}
              ry={4.6}
              fill={light}
              opacity={0.75}
              transform={`rotate(${angle})`}
            />
          ))}
          <circle r={3.8} fill="#f2c14e" stroke="#c99a1c" strokeWidth={0.6} />
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <circle
              key={index}
              cx={Math.cos(index) * 1.8}
              cy={Math.sin(index) * 1.8}
              r={0.5}
              fill="#a8730f"
            />
          ))}
        </>
      );
    case "sequin-patch": {
      const colours = sequinColours(tint);
      const sequins: ReactNode[] = [];
      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 6; col += 1) {
          const cx = -12.5 + col * 5 + (row % 2 === 0 ? 0 : 2.5);
          const cy = -10 + row * 5;
          if (Math.hypot(cx / 16, cy / 13) > 1) continue;
          const colour = colours[(row * 7 + col * 3) % colours.length] ?? tint;
          sequins.push(
            <g key={`${row}-${col}`}>
              <circle cx={cx} cy={cy} r={3.3} fill={colour} stroke={darken(colour, 0.3)} strokeWidth={0.4} />
              <circle cx={cx - 1} cy={cy - 1} r={1} fill="#ffffff" opacity={0.75} />
              <circle cx={cx} cy={cy} r={0.5} fill={darken(colour, 0.45)} />
            </g>,
          );
        }
      }
      return (
        <>
          <ellipse rx={17} ry={14} fill="#1c1220" opacity={0.18} transform="translate(0.8 1.4)" />
          <ellipse rx={17} ry={14} fill="#2b2230" stroke={tint} strokeWidth={0.8} strokeDasharray="1.6 1.2" />
          {sequins}
          <path d="M-9 -12 L-6 -9 M12 -6 L14 -8" stroke="#ffffff" strokeWidth={0.8} strokeLinecap="round" />
        </>
      );
    }
    case "ribbon-belt":
      return (
        <>
          <path d="M-3 4 C-6 12 -9 22 -12 32 L-5 33 C-3 24 -1 14 0 5 Z" fill={deep} />
          <path d="M3 4 C6 12 10 22 14 30 L7 32 C4 24 2 14 0 5 Z" fill={darken(tint, 0.15)} />
          <path d="M-40 -5 Q0 -3 40 -5 L40 5 Q0 7 -40 5 Z" fill={gradient} />
          <path
            d="M-40 -3.4 Q0 -1.4 40 -3.4"
            stroke="#ffffff"
            strokeOpacity={0.35}
            strokeWidth={1}
            fill="none"
          />
          <path
            d="M-40 3.6 Q0 5.6 40 3.6"
            stroke={light}
            strokeOpacity={0.6}
            strokeWidth={0.6}
            fill="none"
            strokeDasharray="1.6 1.4"
          />
          <path
            d="M-2 -1 C-8 -11 -18 -10 -16 -1 C-15 6 -7 5 -2 1 Z"
            fill={gradient}
            stroke={deep}
            strokeWidth={0.7}
          />
          <path
            d="M2 -1 C8 -11 18 -10 16 -1 C15 6 7 5 2 1 Z"
            fill={gradient}
            stroke={deep}
            strokeWidth={0.7}
          />
          <rect
            x={-4}
            y={-5.4}
            width={8}
            height={10.8}
            rx={3}
            fill={gradient}
            stroke={deep}
            strokeWidth={0.7}
          />
          <path
            d="M-12 -6 C-10 -8 -7 -7 -5 -5 M12 -6 C10 -8 7 -7 5 -5"
            stroke="#ffffff"
            strokeOpacity={0.4}
            strokeWidth={1}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    case "pearl":
      return (
        <>
          <circle cx={0.6} cy={1} r={5} fill="#1c1220" opacity={0.2} />
          <circle r={5} fill={gradient} />
          <circle r={5} fill="none" stroke={darken(tint, 0.3)} strokeOpacity={0.5} strokeWidth={0.5} />
          <ellipse
            cx={-1.6}
            cy={-1.8}
            rx={1.6}
            ry={1.1}
            fill="#ffffff"
            opacity={0.95}
            transform="rotate(-30 -1.6 -1.8)"
          />
          <path
            d="M2.6 2.2 A3.6 3.6 0 0 1 -0.6 3.8"
            stroke="#ffffff"
            strokeOpacity={0.4}
            strokeWidth={0.8}
            fill="none"
          />
        </>
      );
    case "star-applique": {
      const outer = 14;
      const inner = 6;
      const points = Array.from({ length: 10 }, (_, index) => {
        const radius = index % 2 === 0 ? outer : inner;
        const angle = (Math.PI / 5) * index - Math.PI / 2;
        return `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`;
      }).join(" ");
      const stitchPoints = Array.from({ length: 10 }, (_, index) => {
        const radius = index % 2 === 0 ? outer - 3 : inner - 1.6;
        const angle = (Math.PI / 5) * index - Math.PI / 2;
        return `${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`;
      }).join(" ");
      return (
        <>
          <polygon points={points} fill="#1c1220" opacity={0.18} transform="translate(0.8 1.4)" />
          <polygon points={points} fill={gradient} stroke={deep} strokeWidth={0.8} strokeLinejoin="round" />
          <polygon
            points={stitchPoints}
            fill="none"
            stroke={darken(tint, 0.45)}
            strokeWidth={0.6}
            strokeDasharray="1.4 1.1"
          />
          <path
            d="M-3 -6 L0 -11 M-6 -2 L-10 -4"
            stroke="#ffffff"
            strokeOpacity={0.6}
            strokeWidth={1.1}
            strokeLinecap="round"
          />
        </>
      );
    }
  }
}

function trimGradient(trimId: TrimId, tint: string, id: string): ReactNode {
  if (trimId === "pearl" || trimId === "button") {
    return (
      <radialGradient id={`${id}-g`} cx="0.36" cy="0.32" r="0.75">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.45" stopColor={tint} />
        <stop offset="1" stopColor={darken(tint, trimId === "pearl" ? 0.18 : 0.28)} />
      </radialGradient>
    );
  }
  return (
    <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stopColor={lighten(tint, 0.38)} />
      <stop offset="0.5" stopColor={tint} />
      <stop offset="1" stopColor={darken(tint, 0.25)} />
    </linearGradient>
  );
}

export function TrimArt({
  trimId,
  x = 0,
  y = 0,
  rotation = 0,
  scale = 1,
  tint,
  selected = false,
}: TrimArtProps) {
  const id = useSvgId("trim");
  const colour = tint ?? TRIM_DEFAULT_TINT[trimId];
  const extent = TRIM_EXTENT[trimId];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`} className="ad-trim">
      <defs>{trimGradient(trimId, colour, id)}</defs>
      {selected ? (
        <rect
          x={-extent.width / 2 - 5}
          y={-extent.height / 2 - 5}
          width={extent.width + 10}
          height={extent.height + 10}
          rx={8}
          fill="rgba(208,88,126,0.08)"
          stroke="#d0587e"
          strokeWidth={1.4}
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {trimBody(trimId, colour, id)}
    </g>
  );
}

export interface TrimBadgeProps {
  trimId: TrimId;
  size?: number | undefined;
  tint?: string | undefined;
  label?: string | undefined;
}

export function TrimBadge({ trimId, size = 64, tint, label }: TrimBadgeProps) {
  const extent = TRIM_EXTENT[trimId];
  const span = Math.max(extent.width, extent.height) * 0.6 + 6;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-span} ${-span} ${span * 2} ${span * 2}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <TrimArt trimId={trimId} tint={tint} />
    </svg>
  );
}

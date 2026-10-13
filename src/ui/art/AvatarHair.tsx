import type { ReactNode } from "react";
import type { HairStyleId } from "../../content/avatarOption";
import { darken, lighten } from "./colourMix";

export interface AvatarHairProps {
  style: HairStyleId;
  colour: string;
}

interface HairTones {
  base: string;
  shadow: string;
  shine: string;
  line: string;
}

function tones(colour: string): HairTones {
  return {
    base: colour,
    shadow: darken(colour, 0.32),
    shine: lighten(colour, 0.38),
    line: darken(colour, 0.5),
  };
}

function bumpyOutline(cx: number, cy: number, rx: number, ry: number, bumps: number, depth: number): string {
  const points: string[] = [];
  for (let index = 0; index <= bumps; index += 1) {
    const angle = (Math.PI * 2 * index) / bumps;
    const x = cx + Math.cos(angle) * rx;
    const y = cy + Math.sin(angle) * ry;
    if (index === 0) {
      points.push(`M${x.toFixed(1)} ${y.toFixed(1)}`);
      continue;
    }
    const mid = (Math.PI * 2 * (index - 0.5)) / bumps;
    const qx = cx + Math.cos(mid) * (rx + depth);
    const qy = cy + Math.sin(mid) * (ry + depth);
    points.push(`Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `${points.join(" ")} Z`;
}

function braidStrand(
  x: number,
  top: number,
  bottom: number,
  bend: number,
  key: string,
  t: HairTones,
): ReactNode {
  const d = `M${x} ${top} C${x + bend} ${top + (bottom - top) * 0.35} ${x - bend} ${top + (bottom - top) * 0.7} ${x} ${bottom}`;
  return (
    <g key={key}>
      <path d={d} stroke={t.line} strokeWidth={6.4} strokeLinecap="round" fill="none" />
      <path d={d} stroke={t.base} strokeWidth={5.2} strokeLinecap="round" fill="none" />
      <path d={d} stroke={t.shadow} strokeWidth={5.2} strokeDasharray="1.6 2.6" fill="none" />
      <path
        d={d}
        stroke={t.shine}
        strokeWidth={1.4}
        strokeDasharray="2 2.2"
        fill="none"
        transform="translate(-1 0)"
        opacity={0.7}
      />
      <rect
        x={x - 3}
        y={bottom - 1}
        width={6}
        height={3.2}
        rx={1.4}
        fill="#e3b44a"
        stroke="#a87c1e"
        strokeWidth={0.4}
      />
    </g>
  );
}

function locStrand(
  x: number,
  top: number,
  bottom: number,
  bend: number,
  key: string,
  t: HairTones,
): ReactNode {
  const d = `M${x} ${top} C${x + bend} ${top + (bottom - top) * 0.35} ${x - bend} ${top + (bottom - top) * 0.7} ${x + bend * 0.4} ${bottom}`;
  return (
    <g key={key}>
      <path d={d} stroke={t.line} strokeWidth={7.4} strokeLinecap="round" fill="none" />
      <path d={d} stroke={t.base} strokeWidth={6} strokeLinecap="round" fill="none" />
      <path
        d={d}
        stroke={t.shine}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeDasharray="2 4"
        fill="none"
        opacity={0.6}
      />
    </g>
  );
}

export function AvatarHairBack({ style, colour }: AvatarHairProps) {
  const t = tones(colour);
  switch (style) {
    case "long-waves":
      return (
        <g>
          <path
            d="M-38 -10 C-46 -48 -16 -56 0 -54 C20 -56 48 -46 40 -8 C46 14 36 32 44 50 C50 66 40 82 26 86 C14 80 -14 80 -26 86 C-40 82 -50 66 -44 50 C-36 32 -46 14 -38 -10 Z"
            fill={t.base}
            stroke={t.line}
            strokeWidth={0.8}
            strokeOpacity={0.5}
          />
          <path
            d="M-36 20 C-40 40 -34 56 -40 72 M38 20 C42 40 36 56 42 72 M-28 40 C-30 56 -26 66 -28 80 M28 40 C30 56 26 66 28 80"
            stroke={t.shadow}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "high-bun":
      return (
        <g>
          <circle
            cx={0}
            cy={-50}
            r={16}
            fill={t.base}
            stroke={t.line}
            strokeWidth={0.8}
            strokeOpacity={0.5}
          />
          <path
            d="M-10 -56 C-4 -62 8 -60 10 -52 M-12 -46 C-4 -40 8 -42 12 -48"
            stroke={t.shadow}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M-6 -60 C0 -64 6 -62 8 -58"
            stroke={t.shine}
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
            opacity={0.8}
          />
        </g>
      );
    case "short-bob":
      return (
        <path
          d="M-40 -8 C-44 -46 -16 -54 0 -54 C16 -54 44 -46 40 -8 C41 10 42 24 38 36 C26 40 -26 40 -38 36 C-42 24 -41 10 -40 -8 Z"
          fill={t.base}
          stroke={t.line}
          strokeWidth={0.8}
          strokeOpacity={0.5}
        />
      );
    case "curly-puff":
      return (
        <g>
          <path
            d={bumpyOutline(0, -30, 46, 36, 18, 6)}
            fill={t.base}
            stroke={t.line}
            strokeWidth={0.8}
            strokeOpacity={0.5}
          />
          {[
            [-30, -44],
            [-14, -58],
            [6, -60],
            [24, -50],
            [36, -30],
            [-38, -22],
            [-22, -36],
            [14, -42],
          ].map(([cx, cy]) => (
            <path
              key={`${cx}${cy}`}
              d={`M${(cx ?? 0) - 4} ${cy} a4 4 0 1 1 6 3`}
              stroke={t.shadow}
              strokeWidth={1.4}
              fill="none"
              strokeLinecap="round"
            />
          ))}
          <path
            d="M-24 -56 C-14 -64 0 -66 10 -64"
            stroke={t.shine}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
            opacity={0.55}
          />
        </g>
      );
    case "braids":
      return (
        <g>
          <path d="M-38 -6 C-44 -46 -16 -54 0 -52 C16 -54 44 -46 38 -6 L36 40 L-36 40 Z" fill={t.shadow} />
          {[-36, -31, -26, -21, 21, 26, 31, 36].map((x, index) =>
            braidStrand(
              x,
              -6 + (index % 3) * 2,
              104 - (index % 3) * 8,
              index % 2 === 0 ? 2.4 : -2.4,
              `b${x}`,
              t,
            ),
          )}
        </g>
      );
    case "pixie":
      return <path d={bumpyOutline(0, -22, 36, 30, 14, 3)} fill={t.shadow} />;
    case "ponytail":
      return (
        <g>
          <path
            d="M20 -40 C44 -46 56 -16 50 14 C46 36 54 56 44 74 C36 62 32 48 32 30 C32 8 30 -14 18 -26 Z"
            fill={t.base}
            stroke={t.line}
            strokeWidth={0.8}
            strokeOpacity={0.5}
          />
          <path
            d="M42 -10 C46 10 40 30 44 52 M36 0 C38 20 36 36 38 56"
            stroke={t.shadow}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "locs":
      return (
        <g>
          <path d="M-38 -6 C-44 -46 -16 -54 0 -52 C16 -54 44 -46 38 -6 L36 40 L-36 40 Z" fill={t.shadow} />
          {[-36, -29, -22, 22, 29, 36].map((x, index) =>
            locStrand(x, -6, 96 - (index % 3) * 10, index % 2 === 0 ? 4 : -4, `l${x}`, t),
          )}
        </g>
      );
  }
}

export function AvatarHairFront({ style, colour }: AvatarHairProps) {
  const t = tones(colour);
  const stroke = { stroke: t.line, strokeWidth: 0.8, strokeOpacity: 0.5 };
  switch (style) {
    case "long-waves":
      return (
        <g>
          <path
            d="M-34 -2 C-38 -36 -14 -50 4 -48 C26 -48 40 -32 34 0 C30 -16 22 -28 8 -33 C-2 -22 -20 -14 -34 -2 Z"
            fill={t.base}
            {...stroke}
          />
          <path d="M-34 -4 C-40 14 -36 30 -30 44 C-27 30 -28 14 -27 2 Z" fill={t.base} {...stroke} />
          <path d="M34 -2 C40 14 36 30 30 44 C27 30 28 14 27 2 Z" fill={t.base} {...stroke} />
          <path
            d="M-20 -38 C-8 -46 10 -46 20 -40 M8 -32 C18 -26 26 -16 30 -6"
            stroke={t.shine}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />
        </g>
      );
    case "high-bun":
      return (
        <g>
          <path
            d="M-33 -2 C-35 -34 -18 -47 0 -47 C18 -47 35 -34 33 -2 C30 -20 18 -32 0 -34 C-18 -32 -30 -20 -33 -2 Z"
            fill={t.base}
            {...stroke}
          />
          <path
            d="M-30 -10 C-26 -24 -14 -32 0 -34 M30 -10 C26 -24 14 -32 0 -34"
            stroke={t.shadow}
            strokeWidth={1}
            fill="none"
          />
          <path
            d="M-16 -42 C-6 -46 8 -46 16 -42"
            stroke={t.shine}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            opacity={0.75}
          />
          <path
            d="M-32 0 C-34 8 -32 14 -30 18 M32 0 C34 8 32 14 30 18"
            stroke={t.base}
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "short-bob":
      return (
        <g>
          <path
            d="M-35 -4 C-38 -38 -16 -50 0 -50 C16 -50 38 -38 35 -4 C30 -12 24 -14 18 -14 C8 -15 -8 -15 -18 -14 C-24 -14 -30 -12 -35 -4 Z"
            fill={t.base}
            {...stroke}
          />
          <path
            d="M-14 -15 L-12 -30 M-2 -15 L-1 -32 M10 -15 L10 -31 M22 -14 L20 -28"
            stroke={t.shadow}
            strokeWidth={1}
            opacity={0.7}
          />
          <path
            d="M-18 -40 C-8 -46 8 -46 18 -40"
            stroke={t.shine}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />
        </g>
      );
    case "curly-puff":
      return (
        <g>
          <path
            d="M-34 -2 C-36 -30 -18 -44 0 -44 C18 -44 36 -30 34 -2 Q32 -10 28 -12 Q26 -18 20 -18 Q16 -24 10 -22 Q4 -26 -2 -22 Q-8 -26 -12 -21 Q-20 -22 -22 -16 Q-28 -16 -29 -10 Q-33 -8 -34 -2 Z"
            fill={t.base}
            {...stroke}
          />
          <path
            d="M-18 -30 a3 3 0 1 1 4 2 M6 -34 a3 3 0 1 1 4 2 M20 -26 a3 3 0 1 1 4 2"
            stroke={t.shadow}
            strokeWidth={1.2}
            fill="none"
          />
        </g>
      );
    case "braids":
      return (
        <g>
          <path
            d="M-33 -2 C-35 -34 -16 -47 0 -47 C16 -47 35 -34 33 -2 C28 -22 14 -34 1 -38 L-1 -38 C-14 -34 -28 -22 -33 -2 Z"
            fill={t.base}
            {...stroke}
          />
          <path
            d="M-22 -34 L-30 -8 M-12 -38 L-24 -18 M12 -38 L24 -18 M22 -34 L30 -8"
            stroke={t.shadow}
            strokeWidth={1.2}
          />
          {braidStrand(-35, -10, 74, 2, "fl", t)}
          {braidStrand(-39, -4, 66, -2, "fl2", t)}
          {braidStrand(35, -10, 70, -2, "fr", t)}
          {braidStrand(39, -4, 62, 2, "fr2", t)}
        </g>
      );
    case "pixie":
      return (
        <g>
          <path
            d="M-33 2 C-38 -36 -14 -52 4 -50 C26 -49 40 -32 33 4 C32 -6 30 -12 27 -16 L25 -9 L20 -20 L15 -13 L9 -24 C2 -18 -8 -18 -16 -24 L-19 -15 L-24 -21 L-27 -11 C-30 -8 -32 -4 -33 2 Z"
            fill={t.base}
            {...stroke}
          />
          <path
            d="M-6 -44 C4 -48 18 -44 24 -34 M-20 -38 C-12 -44 -4 -44 2 -42 M8 -24 C14 -30 22 -32 28 -28"
            stroke={t.shine}
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />
          <path
            d="M-14 -40 L-18 -26 M2 -40 L-2 -26 M16 -38 L14 -26"
            stroke={t.shadow}
            strokeWidth={1.1}
            strokeLinecap="round"
            opacity={0.7}
          />
          <path d="M-32 -2 L-31 10 M32 0 L31 10" stroke={t.base} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case "ponytail":
      return (
        <g>
          <path
            d="M-33 -2 C-36 -34 -16 -47 2 -47 C20 -47 36 -34 33 -2 C30 -20 22 -30 8 -34 C-6 -30 -24 -22 -33 -2 Z"
            fill={t.base}
            {...stroke}
          />
          <path
            d="M-18 -40 C-6 -46 10 -46 20 -40"
            stroke={t.shine}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            opacity={0.75}
          />
          <path d="M24 -34 L32 -40 L34 -34 L26 -28 Z" fill="#d0587e" />
        </g>
      );
    case "locs":
      return (
        <g>
          <path
            d="M-33 -2 C-35 -34 -16 -47 0 -47 C16 -47 35 -34 33 -2 C28 -22 14 -34 4 -37 L-4 -37 C-14 -34 -28 -22 -33 -2 Z"
            fill={t.base}
            {...stroke}
          />
          {locStrand(-34, -18, 64, 3, "f1", t)}
          {locStrand(-38, -10, 58, -3, "f2", t)}
          {locStrand(35, -18, 60, -3, "f3", t)}
          {locStrand(39, -10, 54, 3, "f4", t)}
        </g>
      );
  }
}
